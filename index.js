#!/usr/bin/env node
const utils = require('@mistkafka/zhenguo-js-lib');
const _ = require('lodash');
const memberAlias = require('./member-alias');
const CliTable = require('cli-table3');
const { program } = require('commander');
const {storage, storageInitP} = require('./storage');
const moment = require('moment');
const crypto = require('crypto');


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
    await storageInitP;
    let data = await storage.getItem(this.wclId);
    if (!data) {
      // const url = `https://classic.warcraftlogs.com/reports/fights-and-participants/${this.wclId}/0`
      // const res = await utils.jsonRequest(url);
      // data = res.data;
      data = {"fights":[{"id":1,"boss":623,"start_time":0,"end_time":356482,"name":"不稳定的海度斯","zoneID":548,"zoneName":"毒蛇神殿","zoneDifficulty":3,"size":25,"difficulty":3,"kill":true,"partial":3,"bossPercentage":1,"fightPercentage":1,"lastPhaseForPercentageDisplay":0,"maps":[332]},{"id":2,"boss":624,"start_time":1310790,"end_time":1787151,"name":"鱼斯拉","zoneID":548,"zoneName":"毒蛇神殿","zoneDifficulty":3,"size":25,"difficulty":3,"kill":true,"partial":3,"bossPercentage":1,"fightPercentage":1,"lastPhaseForPercentageDisplay":0,"maps":[332]},{"id":3,"boss":0,"originalBoss":627,"start_time":2748512,"end_time":2752394,"name":"莫洛格里·踏潮者","zoneID":548,"zoneName":"毒蛇神殿","zoneDifficulty":3},{"id":4,"boss":627,"start_time":6155115,"end_time":6606372,"name":"莫洛格里·踏潮者","zoneID":548,"zoneName":"毒蛇神殿","zoneDifficulty":3,"size":25,"difficulty":3,"kill":true,"partial":3,"bossPercentage":1,"fightPercentage":1,"lastPhaseForPercentageDisplay":0,"maps":[332]},{"id":5,"boss":626,"start_time":7942076,"end_time":8039351,"name":"深水领主卡拉瑟雷斯","zoneID":548,"zoneName":"毒蛇神殿","zoneDifficulty":3,"size":25,"difficulty":3,"kill":false,"partial":1,"bossPercentage":1,"fightPercentage":1,"lastPhaseForPercentageDisplay":0,"maps":[332]},{"id":6,"boss":625,"start_time":8903773,"end_time":9348646,"name":"盲眼者莱欧瑟拉斯","zoneID":548,"zoneName":"毒蛇神殿","zoneDifficulty":3,"size":25,"difficulty":3,"kill":true,"partial":3,"bossPercentage":1,"fightPercentage":1,"lastPhaseForPercentageDisplay":0,"maps":[332]}],"lang":"cn","friendlies":[{"name":"撷罗","id":7,"guid":10501813,"type":"Mage","server":"碧玉矿洞","icon":"Mage-Arcane","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"唐萍淑","id":14,"guid":60410108,"type":"Warlock","server":"碧玉矿洞","icon":"Warlock-Destruction","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"暗夜猎奇","id":19,"guid":13088711,"type":"Hunter","server":"碧玉矿洞","icon":"Hunter-Survival","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"蓝沙小术","id":20,"guid":16394588,"type":"Warlock","server":"碧玉矿洞","icon":"Warlock-Destruction","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"忙着可爱","id":16,"guid":23200126,"type":"Priest","server":"碧玉矿洞","icon":"Priest-Holy","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"指上丶弹冰","id":80,"guid":21783536,"type":"Mage","server":"碧玉矿洞","icon":"Mage-Frost","fights":".5.6.","bosses":".626.625."},{"name":"喜宝丶","id":10,"guid":57304277,"type":"Mage","server":"碧玉矿洞","icon":"Mage-Frost","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"黎明挽歌","id":2,"guid":23271471,"type":"Paladin","server":"碧玉矿洞","icon":"Paladin-Holy","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"Blackbeans","id":5,"guid":20632196,"type":"Mage","server":"碧玉矿洞","icon":"Mage-Arcane","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"抗霸子","id":12,"guid":36764157,"type":"Druid","server":"碧玉矿洞","icon":"Druid-Restoration","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"五月未央","id":22,"guid":64739121,"type":"Shaman","server":"碧玉矿洞","icon":"Shaman-Elemental","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"法利斯","id":15,"guid":5857501,"type":"Priest","server":"碧玉矿洞","icon":"Priest-Shadow","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"黑暗治疗师","id":9,"guid":19641697,"type":"Priest","server":"碧玉矿洞","icon":"Priest-Holy","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"紫蓝伶","id":18,"guid":7664074,"type":"Priest","server":"碧玉矿洞","icon":"Priest-Holy","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"脆皮啼","id":1,"guid":4772140,"type":"Warrior","server":"碧玉矿洞","icon":"Warrior","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"糖三勺","id":24,"guid":12024944,"type":"Mage","server":"碧玉矿洞","icon":"Mage-Arcane","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"吖米娃娃","id":8,"guid":9617395,"type":"Mage","server":"碧玉矿洞","icon":"Mage-Arcane","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"半支煙","id":70,"guid":12233522,"type":"Rogue","server":"碧玉矿洞","icon":"Rogue-Combat","fights":".4.5.","bosses":".627.626."},{"name":"冰飞","id":17,"guid":6858555,"type":"Warrior","server":"碧玉矿洞","icon":"Warrior","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"撸个串串","id":6,"guid":5220943,"type":"Warlock","server":"碧玉矿洞","icon":"Warlock-Destruction","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"心往神驰","id":23,"guid":58428313,"type":"Shaman","server":"碧玉矿洞","icon":"Shaman-Restoration","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"Tranzan","id":54,"guid":19535813,"type":"Mage","server":"碧玉矿洞","icon":"Mage-Frost","fights":".2.3.4.","bosses":".624.0.627."},{"name":"暖阳与猫","id":21,"guid":143949,"type":"Hunter","server":"碧玉矿洞","icon":"Hunter-BeastMastery","fights":".1.2.3.6.","bosses":".623.624.0.625."},{"name":"小龙人的妈妈","id":13,"guid":58253432,"type":"Shaman","server":"碧玉矿洞","icon":"Shaman-Elemental","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"明月上弦","id":11,"guid":65481225,"type":"Hunter","server":"碧玉矿洞","icon":"Hunter-BeastMastery","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"飛騰","id":3,"guid":42627168,"type":"Paladin","server":"碧玉矿洞","icon":"Paladin-Protection","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."},{"name":"踏潮潜伏者","id":73,"guid":21920,"type":"NPC","icon":"custom-icon-ability_druid_rake.jpg","fights":".4.","instanceCounts":{"fight0":84,"fight4":84},"instanceGroupCounts":{"fight0":5,"fight4":5},"bosses":".627."},{"name":"沁园","id":4,"guid":23815181,"type":"Mage","server":"碧玉矿洞","icon":"Mage-Arcane","fights":".1.2.3.4.5.6.","bosses":".623.624.0.627.626.625."}],"enemies":[{"name":"深水领主卡拉瑟雷斯","id":82,"guid":21214,"type":"Boss","icon":"custom-icon-spell_fire_sealoffire.jpg","fights":".5.","instanceCounts":{"fight0":1,"fight5":1},"bosses":".626."},{"name":"暗心缚法者","id":85,"guid":21806,"type":"NPC","icon":"custom-icon-spell_shadow_unholyfrenzy.jpg","fights":".6.","instanceCounts":{"fight0":3,"fight6":3},"instanceGroupCounts":{"fight0":1,"fight6":1},"bosses":".625."},{"name":"鱼斯拉","id":55,"guid":21217,"type":"Boss","icon":"custom-icon-spell_nature_lightningshield.jpg","fights":".2.","instanceCounts":{"fight0":1,"fight2":1},"instanceGroupCounts":{"fight0":4,"fight2":4},"bosses":".624."},{"name":"纯净的海度斯爪牙","id":48,"guid":22035,"type":"NPC","icon":"custom-icon-trade_engineering.jpg","fights":".1.","instanceCounts":{"fight0":8,"fight1":8},"instanceGroupCounts":{"fight0":3,"fight1":3},"bosses":".623."},{"name":"盘牙伏击者","id":59,"guid":21865,"type":"NPC","icon":"custom-icon-ability_marksmanship.jpg","fights":".2.","instanceCounts":{"fight0":18,"fight2":18},"instanceGroupCounts":{"fight0":4,"fight2":4},"bosses":".624."},{"name":"内心之魔","id":91,"guid":21857,"type":"NPC","icon":"custom-icon-spell_shadow_shadowbolt.jpg","fights":".6.","instanceCounts":{"fight0":15,"fight6":15},"instanceGroupCounts":{"fight0":3,"fight6":3},"bosses":".625."},{"name":"被污染的水元素","id":27,"guid":21253,"type":"NPC","icon":"NPC","fights":".1.","instanceCounts":{"fight0":2,"fight1":2},"instanceGroupCounts":{"fight0":1,"fight1":1},"bosses":".623."},{"name":"盘牙守护者","id":58,"guid":21873,"type":"NPC","icon":"custom-icon-ability_warrior_cleave.jpg","fights":".2.","instanceCounts":{"fight0":9,"fight2":9},"instanceGroupCounts":{"fight0":3,"fight2":3},"bosses":".624."},{"name":"污染的海度斯爪牙","id":41,"guid":22036,"type":"NPC","icon":"custom-icon-trade_engineering.jpg","fights":".1.","instanceCounts":{"fight0":8,"fight1":8},"instanceGroupCounts":{"fight0":2,"fight1":2},"bosses":".623."},{"name":"莫洛格里·踏潮者","id":66,"guid":21213,"type":"Boss","icon":"custom-icon-spell_nature_earthquake.jpg","fights":".3.4.","instanceCounts":{"fight0":1,"fight3":1,"fight4":1},"bosses":".0.627."},{"name":"踏潮潜伏者","id":73,"guid":21920,"type":"NPC","icon":"custom-icon-ability_druid_rake.jpg","fights":".4.","instanceCounts":{"fight0":84,"fight4":84},"instanceGroupCounts":{"fight0":5,"fight4":5},"bosses":".627."},{"name":"不稳定的海度斯","id":26,"guid":21216,"type":"Boss","icon":"custom-icon-spell_frost_manarecharge.jpg","fights":".1.","instanceCounts":{"fight0":1,"fight1":1},"bosses":".623."},{"name":"盲眼者莱欧瑟拉斯","id":86,"guid":21215,"type":"Boss","icon":"custom-icon-ability_gouge.jpg","fights":".6.","instanceCounts":{"fight0":1,"fight6":1},"bosses":".625."},{"name":"莱欧瑟拉斯之影","id":95,"guid":21875,"type":"NPC","icon":"custom-icon-spell_fire_felflamebolt.jpg","fights":".6.","instanceCounts":{"fight0":1,"fight6":1},"bosses":".625."}],"friendlyPets":[{"name":"强力火元素","id":43,"guid":15438,"type":"Pet","icon":"abilities/spell_fire_elemental_totem.jpg","petOwner":13,"fights":".1.4.","instanceCounts":{"fight0":1,"fight1":1,"fight4":1},"bosses":".623.627."},{"name":"掠食者","id":56,"guid":17256082,"type":"Pet","icon":"abilities/ability_hunter_beastcall.jpg","petOwner":19,"fights":".2.4.6.","instanceCounts":{"fight0":1,"fight2":1,"fight4":1,"fight6":1},"bosses":".624.627.625."},{"name":"熔岩图腾 V","id":93,"guid":15484,"type":"Pet","icon":"abilities/spell_fire_selfdestruct.jpg","petOwner":13,"fights":".6.","instanceCounts":{"fight0":2,"fight6":2},"bosses":".625."},{"name":"水元素","id":60,"guid":510,"type":"Pet","icon":"abilities/spell_frost_summonwaterelemental_2.jpg","petOwner":54,"fights":".2.4.","instanceCounts":{"fight0":3,"fight2":3,"fight4":2},"bosses":".624.627."},{"name":"暗影魔","id":61,"guid":19668,"type":"Pet","icon":"abilities/spell_shadow_shadowfiend.jpg","petOwner":16,"fights":".2.","instanceCounts":{"fight0":1,"fight2":1},"bosses":".624."},{"name":"强力土元素","id":78,"guid":15352,"type":"Pet","icon":"abilities/spell_nature_earthelemental_totem.jpg","petOwner":77,"fights":".4.","instanceCounts":{"fight0":1,"fight4":1},"bosses":".627."},{"name":"蒸汽坦克","id":92,"guid":19405,"type":"Pet","icon":"Pet","petOwner":11,"fights":".6.","instanceCounts":{"fight0":2,"fight6":2},"bosses":".625."},{"name":"暗影魔","id":63,"guid":19668,"type":"Pet","icon":"abilities/spell_shadow_shadowfiend.jpg","petOwner":18,"fights":".2.4.6.","instanceCounts":{"fight0":1,"fight2":1,"fight4":1,"fight6":1},"bosses":".624.627.625."},{"name":"地缚图腾","id":79,"guid":2630,"type":"Pet","icon":"abilities/spell_nature_strengthofearthtotem02.jpg","petOwner":22,"fights":".4.","instanceCounts":{"fight0":1,"fight4":1},"bosses":".627."},{"name":"蒸汽坦克","id":62,"guid":19405,"type":"Pet","icon":"Pet","petOwner":21,"fights":".2.","instanceCounts":{"fight0":1,"fight2":1},"bosses":".624."},{"name":"南瓜饼","id":29,"guid":19268942,"type":"Pet","icon":"abilities/ability_hunter_beastcall.jpg","petOwner":21,"fights":".1.2.3.6.","instanceCounts":{"fight0":1,"fight1":1,"fight2":1,"fight3":1,"fight6":1},"bosses":".623.624.0.625."},{"name":"土元素图腾","id":77,"guid":15430,"type":"Pet","icon":"abilities/spell_nature_earthelemental_totem.jpg","petOwner":23,"fights":".4.","instanceCounts":{"fight0":1,"fight4":1},"bosses":".627."},{"name":"暗影魔","id":51,"guid":19668,"type":"Pet","icon":"abilities/spell_shadow_shadowfiend.jpg","petOwner":15,"fights":".1.2.4.5.6.","instanceCounts":{"fight0":1,"fight1":1,"fight2":1,"fight4":1,"fight5":1,"fight6":1},"bosses":".623.624.627.626.625."},{"name":"火元素图腾","id":42,"guid":15439,"type":"Pet","icon":"abilities/spell_fire_elemental_totem.jpg","petOwner":13,"fights":".1.4.","instanceCounts":{"fight0":1,"fight1":1,"fight4":1},"bosses":".623.627."},{"name":"地缚图腾","id":76,"guid":2630,"type":"Pet","icon":"abilities/spell_nature_strengthofearthtotem02.jpg","petOwner":23,"fights":".4.","instanceCounts":{"fight0":2,"fight4":2},"bosses":".627."},{"name":"水元素","id":44,"guid":510,"type":"Pet","icon":"abilities/spell_frost_summonwaterelemental_2.jpg","petOwner":10,"fights":".1.2.4.6.","instanceCounts":{"fight0":4,"fight1":2,"fight2":2,"fight4":4,"fight6":1},"bosses":".623.624.627.625."},{"name":"暗影魔","id":45,"guid":19668,"type":"Pet","icon":"abilities/spell_shadow_shadowfiend.jpg","petOwner":9,"fights":".1.2.4.6.","instanceCounts":{"fight0":1,"fight1":1,"fight2":1,"fight4":1,"fight6":1},"bosses":".623.624.627.625."},{"name":"掠食者","id":31,"guid":19452131,"type":"Pet","icon":"abilities/ability_hunter_beastcall.jpg","petOwner":11,"fights":".1.2.4.5.6.","instanceCounts":{"fight0":1,"fight1":1,"fight2":1,"fight4":1,"fight5":1,"fight6":1},"bosses":".623.624.627.626.625."}],"enemyPets":[],"abilities":[{"name":"Unknown Ability","guid":0,"type":0,"abilityIcon":"inv_axe_02.jpg"}],"phases":[],"logVersion":14,"gameVersion":3};
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
    this.name2player = this.friendlies.reduce((name2player, item) => {
      if (name2player[item.name]) {
        throw Error('需要升级程序。同一次活动中，存在同名玩家，无法以玩家名作为key。')
      }
      name2player[item.name] = item;
      return name2player;
    }, {})
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
      fineSalaries,
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

    const fineTable = new CliTable({
      head: ['罚款项', '罚款金额', '罚款人数', '罚款总额', '具体人员']
    });
    const fines = fineSalaries.map(subsidy => {
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
    fineTable.push(...fines)
    console.log(fineTable.toString());

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

  saveMemberSalariesToFile() {
    const {
      memberSalaries,
    } = this.getSalaries();
    const totalSendSalary = this.sumMemberSalaries(memberSalaries);
    console.log('总邮寄人数：' + memberSalaries.length);
    console.log('总邮寄工资：' + totalSendSalary);


    const eventId = this.wcl.wclId;
    const eventTime = moment(this.config.date).unix();
    const salaries = memberSalaries.map(x => {
      // 使用角色+wclId的md5 hash来作为工资的uuid，
      // 这样多次执行uuid保持不变
      const playerEventKey = x.name + '-' + x.server + '-' + eventId;
      const hash = crypto.createHash('md5').update(playerEventKey).digest('hex');
      const detailItems = x.salaries.map(y => {
        return {
          item: y.note,
          value: y.value,
        }
      });
      const total = _.sum(detailItems.map(y => y.value))
      return {
        uuid: hash,
        eventId,
        name: x.name,
        server: x.server,
        total,
        detailItems,
        optLogs: [],
        timeRemoved: 0,
        timeSent: 0,
      }
    });
    const eventInfo = {
      id: eventId,
      title: this.config.subject,
      eventTime,
      emailBody: this.config.body,
      isCompleted: false,
      timeRemoved: 0,
      salaries,
    }

    const jsonContent = JSON.stringify(eventInfo);
    const base64Content = Buffer.from(jsonContent).toString('base64');
    const lines = _.chunk(base64Content, 80).map(chars => chars.join(''))
    const commentLines = [
      '-- WCL Id： ' + eventInfo.id,
      '-- 活动标题：' + eventInfo.title,
      '-- 活动日期：' + this.config.date,
      '-- 总邮寄人数：' + eventInfo.salaries.length,
      '-- 总邮寄金额：' + totalSendSalary
    ];
    const humanityBase64Content = [
      ...commentLines,
      ...lines,
      ...commentLines,
    ].join('\n');



    utils.writeContentToFile(`./events/${this.date}/data.txt`, humanityBase64Content);
    utils.writeContentToFile(`./events/${this.date}/debug_data.json`, JSON.stringify(eventInfo, null, 4));
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
    const fineSalaries = this.config.fines.map(x => {
      return {
        ...x,
        value: -x.value,
      }
    });
    const salaries = [
      this.getAssembleSubsidy(),
      ...this.config.subsidies,
      ...salaryInfo.basicSalaries,
      ...fineSalaries,
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

    const skipSendNames = (this.config.skipSend || []).map(x => memberAlias[x] || x);

    const memberSalaries = Object.entries(membersMapping).map(([member, memberSalaryItems]) => {
      const player = this.wcl.name2player[member];
      if (!player) {
        throw Error('暂时不要使用别名，会导致找不到角色服务器名。')
      }
      return {
        name: member,
        server: player.server,
        salaries: memberSalaryItems,
      }
    }).filter(x => !skipSendNames.includes(x.name));

    return {
      fineSalaries,
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

    let validPlayer = this.wcl.friendlies.filter(x => x.playerKilledBosses.length).filter(x => !['作战小鸡', '见习死亡骑士'].includes(x.name))
    const excludes = this.config.exclude || [];
    const skipSends = this.config.skipSend || [];
    validPlayer = validPlayer.filter(x => !excludes.includes(x.name));
    validPlayer.forEach(x => {
      x.skipSend = skipSends.includes(x.name);
    })
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
  salaryCalculator.saveMemberSalariesToFile();
}

run();

