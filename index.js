#!/usr/bin/env node
const utils = require('@mistkafka/zhenguo-js-lib');
const _ = require('lodash');
const memberAlias = require('./member-alias');
const CliTable = require('cli-table3');
const NodeStorage = require('node-persist');
const js2Lua = require('./lua-utils');
const { program } = require('commander');

const storage = NodeStorage.create({
  dir: '/Users/zhenguo/.cache/wow-salary/'
});

program.version('1.0.0');
program
  .requiredOption('-d, --date <date>', '活动日期，如2021-01-11');
program.parse(process.argv);


class WCL {
  constructor(wclId) {
    this.wclId = wclId;
    this.summaryData = null;
    this.fights = [];
    this.id2fight = {}
    this.bossFights = [];
    this.killedBossFights = [];
    this.friendlies = [];
    this.name2player = {};
  }

  async loadSummaryData() {
    if (!this.wclId) throw Error('wcl id is miss');
    await storage.init();
    let data = await storage.getItem(this.wclId);
    if (!data) {
      const res = await utils.jsonRequest(`https://cn.classic.warcraftlogs.com/reports/fights-and-participants/${this.wclId}/0`);
      data = res.data;
      await storage.setItem(this.wclId, data);
    }

    this.summaryData = data;
    this.fights = data.fights;
    this.id2fight = _.keyBy(this.fights, x => x.id)
    this.bossFights = this.fights.filter(x => x.boss);
    this.killedBossFights = this.bossFights.filter(x => x.kill);

    const friendlies = data.friendlies.filter(x => x.type !== 'NPC');
    this.friendlies = friendlies.map(player => {
      const playerFightIds = player.fights.split('.').filter(x => x);
      playerFightIds.forEach(fightId => {
        const fight = this.id2fight[fightId];
        const players = fight.players = fight.players || [];
        players.push(player.name)
      })

      const playerKilledBosses = playerFightIds.map(x => this.id2fight[x]).filter(x => x.boss && x.kill).map(x => x.name);

      return {
        ...player,
        playerFightIds,
        playerKilledBosses,
      }
    })
    this.name2player = _.keyBy(this.friendlies, x => x.name);
  }
}

function goldInt(n) {
  if (typeof n === 'number') {
    n = n.toString();
  }

  return Number.parseInt(n);
}

class SalaryCalculator {
  constructor(date) {
    this.date = date;
    this.config = utils.loadJson(`./events/${date}/meta.json`);
    this.wcl = new WCL(this.config.wclId);
    this.loadWclP = this.wcl.loadSummaryData();
  }

  display() {
    const {
      memberSalaries,
      countInfo,
    } = this.getSalaries();

    const countInfoTable = new CliTable({
      head: ['总收入', '总补贴', '总击杀数', '总击杀人次', '工资/击杀人次', '装备总收入', '罚款总收入'],
    });
    countInfoTable.push(...[
      [
        countInfo.totalIncome,
        countInfo.totalSubsidy,
        countInfo.totalKilledBoss,
        countInfo.totalPlayerKillTimes,
        countInfo.perPlayerKillTimesSalary,
        countInfo.equipmentIncome,
        countInfo.totalFineIncome,
      ]
    ]);
    console.log(countInfoTable.toString());

    const subsidyTable = new CliTable({
      head: ['补贴项', '补贴金额', '补贴人数', '补贴总额', '具体人员']
    });
    const subsidies = [
      this.getAssembleSubsidy(),
      ...this.config.subsidies,
    ].map(subsidy => {
      const itemCount = subsidy.members.length;
      let membersStr = subsidy.members.join(', ');
      if (membersStr.length > 50) {
        membersStr = membersStr.substring(0, 50) + '...'
      }
      return [
        subsidy.note,
        subsidy.value,
        itemCount,
        itemCount * subsidy.value,
        membersStr,
      ]
    })
    subsidyTable.push(...subsidies)
    console.log(subsidyTable.toString());

    const memberSalaryTable = new CliTable({
      head: ['序号', '角色', '总工资', '明细'],
    })
    const invalidPlayerTotalSalaries = [];
    const memberSalaryRows = memberSalaries.map((x, index) => {
      const total = _.sum(x.salaries.map(x => x.value));
      if (total < 0) {
        invalidPlayerTotalSalaries.push({
          name: x.name,
          total: total,
        })
      }
      const detail = x.salaries.map(x => `${x.note}: ${x.value}, `).join('')
      return [
        index + 1,
        x.name,
        total,
        detail,
      ]
    });
    memberSalaryTable.push(...memberSalaryRows);
    console.log(memberSalaryTable.toString());

    console.log(`${invalidPlayerTotalSalaries.length}人罚款不够抵工资！`)
    if (invalidPlayerTotalSalaries.length !== 0) {
      console.log(JSON.stringify(invalidPlayerTotalSalaries, null, 2))
    }

    const assembleSubsidy = this.getAssembleSubsidy()
    const invalidAssembleSubsidyMembers = assembleSubsidy.members
      .map(x => {
        const wclPlayer = this.wcl.name2player[x] || null;
        return {
          name: x,
          wclPlayer,
        };
      })
      .filter(info => {
        if (info.wclPlayer === null) {
          return true;
        }

        if (info.wclPlayer.playerFightIds.length === 0) {
          return true;
        }

        return false;
      });
    if (invalidAssembleSubsidyMembers.length) {
      throw Error(`${invalidAssembleSubsidyMembers.length}人早到补贴异常，未参加过任何战斗！${invalidAssembleSubsidyMembers.map(x => x.name).join(', ')}`)
    }
  }

  saveMemberSalariesToFiles(batchSize=20) {
    const {
      memberSalaries,
    } = this.getSalaries();
    const totalSendSalary = this.sumMemberSalaries(memberSalaries);
    const batches = _.chunk(memberSalaries, batchSize);
    console.log('总邮寄人数：' + memberSalaries.length);
    console.log('总邮寄工资：' + totalSendSalary);
    console.log('每批次邮寄数目：' + batchSize);
    console.log('批次数：' + batches.length);

    batches.forEach((items, index) => {
      const fileName = `email_salary_item_${index + 1}.lua`
      const totalSalary = this.sumMemberSalaries(items);
      let content = `-- 批次：${index + 1}. \n-- 邮寄数目：${items.length}.\n-- 邮寄总额：${totalSalary}. \n\n\n\n`;
      const subject = this.config.date + ', ' + this.config.subject;
      let luaContent = `
emailConfig = {}
emailConfig.subject = "${subject}"
emailConfig.body = "${this.config.body}"
emailConfig.names = ${js2Lua(items)}
      `
      content = content + luaContent;

      utils.writeContentToFile(`./events/${this.date}/${fileName}`, content);
    });
  }

  sumMemberSalaries(items)  {
    return _.sum(items.map(
      x => _.sum(x.salaries.map(
        y => y.value
      ))
    ));
  }

  getSalaries() {
    const salaryInfo = this.getBasicSalaryInfo();
    const fineSalary = this.config.fines.map(x => {
      return {
        ...x,
        value: -x.value,
      }
    });
    const salaries = [
      this.getAssembleSubsidy(),
      ...this.config.subsidies,
      ...salaryInfo.basicSalaries,
      ...fineSalary,
    ];
    const countInfo = {...salaryInfo};
    delete countInfo.basicSalaries;

    const membersMapping = {};
    for (const salaryItem of salaries) {
      for (let member of salaryItem.members) {
        member = memberAlias[member] || member;
        const memberSalaryItems = membersMapping[member] = membersMapping[member] || [];
        memberSalaryItems.push({
          note: salaryItem.note,
          value: salaryItem.value,
        })
      }
    }

    for (const trans of this.config.translations) {
      const {
        from,
        to,
        value,
        note
      } = trans;
      const fromSalaryItems = membersMapping[from] = membersMapping[from] || [];
      const toSalaryItems = membersMapping[to] = membersMapping[to] || [];
      const fromBalance = _.sum(fromSalaryItems.map(x => x.value));
      if (fromBalance < value) {
        throw Error(`${from} -- ${value} --> ${to} 的转账失败，余额不足！余额：${fromBalance}`);
      } else {
        fromSalaryItems.push({
          note: `转账给"${to}" (${note})`,
          value: -value,
        })
        toSalaryItems.push({
          note: `来自"${from}"的汇款 (${note})`,
          value: value,
        })
      }
    }

    const memberSalaries = Object.entries(membersMapping).map(([member, memberSalaryItems]) => {
      return {
        name: member,
        salaries: memberSalaryItems,
      }
    });

    return {
      salaries,
      memberSalaries,
      countInfo,
    }
  }

  getAssembleSubsidy() {
    const {equipmentIncome, assemblePlayersStr} = this.config;
    let assemblePlayers = assemblePlayersStr.split(',').map(x => x.trim()).filter(x => x);
    assemblePlayers = _.unionBy(assemblePlayers, x => memberAlias[x] || x)
    let value = 0;
    if (assemblePlayers.length !== 0) {
      value = goldInt(Math.min((equipmentIncome * 0.1) / assemblePlayers.length, 100));
    }

    return {
      note: '早到补贴',
      value,
      members: assemblePlayers,
    }
  }

  calcTotalSubsidy() {
    const {subsidies} = this.config;
    const allSubsidies = [...subsidies, this.getAssembleSubsidy()];
    return _.sum(allSubsidies.map(({value, members}) => value * members.length))
  }

  calcTotalFine() {
    const {fines} = this.config;
    return _.sum(fines.map(({value, members}) => {
      if (value < 0) {
        throw Error('罚款金额请用正数');
      }
      return value * members.length
    }));
  }

  getBasicSalaryInfo() {
    const {equipmentIncome} = this.config;
    const totalFineIncome = this.calcTotalFine();
    const totalIncome = equipmentIncome + totalFineIncome;
    const totalSubsidy = this.calcTotalSubsidy();
    const totalBasicSalary = totalIncome - totalSubsidy;

    const validPlayer = this.wcl.friendlies.filter(x => x.playerKilledBosses.length);
    const totalKilledBoss  = this.wcl.killedBossFights.length;
    const totalPlayerKillTimes = _.sum(validPlayer.map(x => x.playerKilledBosses.length));
    const perPlayerKillTimesSalary = totalBasicSalary / totalPlayerKillTimes;

    const playerSalaries = validPlayer.map(player => {
      const totalPlayerKilledCount = player.playerKilledBosses.length;
      return {
        name: player.name,
        value: goldInt(totalPlayerKilledCount * perPlayerKillTimesSalary),
        note: `基本工资(${totalPlayerKilledCount}/${totalKilledBoss})`
      }
    });
    const groupedPlayerSalaries = _.groupBy(playerSalaries, x => x.value);

    const basicSalaries = Object.values(groupedPlayerSalaries).map(salaries => {
      const {note, value} = salaries[0];
      const members = salaries.map(x => x.name);
      return {
        note,
        members,
        value,
      }
    });

    return {
      totalIncome,
      totalSubsidy,
      totalBasicSalary,
      totalKilledBoss,
      totalPlayerKillTimes,
      equipmentIncome,
      totalFineIncome,
      perPlayerKillTimesSalary: Number.parseFloat(perPlayerKillTimesSalary.toFixed(2)),
      basicSalaries,
    }
  }
}


async function run() {
  const salaryCalculator = new SalaryCalculator(program.date);
  await salaryCalculator.loadWclP;
  salaryCalculator.display();
  salaryCalculator.saveMemberSalariesToFiles();
}

run();

