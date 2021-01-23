
var s = `
冰飞
凍顶乌龙
佘大宝
Sokodayo
盾牌砸死你
星夜乱舞
Ayanamirei
燕归迷你菇
朝天子
弄夜
Deathcomes
风火雷星
Pluck
百威治百病
希水
刺客的信条
方丹
毛毛猪
最酷
撸个串串
Blackbeans
缘聚缘散
流风吹雪
飛騰
白垩圣骑
胖胖的包
忙着可爱
雨玲珑
黑不是我的错
雪舞幽兰
紫蓝伶
蓝色的梦
暗夜猎奇
柬埔寨小公主
周老师
猎仁九命
黎明挽歌
糖三勺
喝诶黑嘚讴豆
丶石老师丶
光头佬腊肉
Tranzan
`;

var zaodao = `

紫蓝伶
光头佬腊肉
冰飞
佘大宝
抗霸子
Pluck
奈何桥上
柬埔寨小公主
黎明挽歌
忙着可爱
撸个串串
朝天子
刺客的信条
暗夜猎奇
Ayanamirei
飛騰
雨玲珑
黑不是我的错
周老师
雪舞幽兰
盾牌砸死你
燕归迷你菇
Deathcomes
弄夜
白垩圣骑
黑暗治疗师
蓝色的梦
Blackbeans
燕子的夏天
阿尔法懒
沧海魔神
初见未央
希水
百威治百病
流风吹雪
`;

const NAME_ALIAS = {
    '流风吹雪': ['流云舞雪', '皮多多'],
    '脆皮啼': ['肯帕蕾拉'],
    '燕归迷你菇': ['兜兜木有猫猫', '蘑了个菇喽'],
    '抗霸子': ['偷格心', '捡马拉古打天', '晓了显火'],
    '雪舞幽兰': ['莫兰迪灰', '心无禁忌'],
    '丁勾的宝箱号': ['黑不是我的错', '迷雾卡夫卡', '如果我有暖香'],
    '猎仁九命': ['光头佬腊肉'],
    '喝诶黑嘚讴豆': ['Blackbeans'],
    '佘大宝': ['阿尔法队长'],
    '胖胖的包': ['Tranzan'],
    '周老师': ['丶石老师丶']
}

function run() {
    const salaries = [
        {
            note: '基本工资(3/9 boss)',
            members: ['抓不住', '抗霸子'],
            value: Number.parseInt((1656 * 1/3).toString()),
        },
        {
            note: '基本工资(6/9 boss)',
            members: ['燕子的夏天', '卧糙'],
            value: Number.parseInt((1656 * 2/3).toString()),
        },
        {
            note: '基本工资',
            members: getNames(s),
            value: 1656,
        },
        {
            note: '早到补贴',
            members: getNames(zaodao),
            value: 100,
        },
        {
            note: '开荒预留资金10%',
            members: ['丁勾的附魔号'],
            value: 8000
        },
        {
            note: '补助: 活动假人（累计75个，修理机器人n个）',
            members: getNames('黑不是我的错'),
            value: 450,
        },
        {
            note: '泰坦',
            members: ['冰飞', '抗霸子'],
            value: 650,
        },

    ];

    const membersMapping = {};

    for (const salaryItem of salaries) {
        for (const member of salaryItem.members) {
            const memberSalaryItems = membersMapping[member] = membersMapping[member] || [];
            memberSalaryItems.push({
                note: salaryItem.note,
                value: salaryItem.value,
            })
        }
    }

    const luaMemberSalaries = Object.entries(membersMapping).map(([member, memberSalaryItems]) => {
        return {
            name: member,
            salaries: memberSalaryItems,
        }
    });

    console.log(`总共${getNames(s).length}人分G`)

    console.log(jsToLua(luaMemberSalaries));
}


function jsToLua(obj) {
    return valToLua(obj, -1)
}

function objToLua(obj, indentLevel=0) {
    const lines = Object.entries(obj).map(([key, val]) => {
        const valStr = valToLua(val, indentLevel);
        return `    ${key} = ${valStr},`;
    });

    return '{\n' + [
        ...lines,
        '}'
    ].map(line => '    '.repeat(indentLevel) + line).join('\n')
}

function arrToLua(arr, indentLevel=0) {
    const lines = arr.map((val) => {
        const valStr = valToLua(val, indentLevel);
        return `    ${valStr},`;
    });

    return '{\n' + [
        ...lines,
        '}'
    ].map(line => '    '.repeat(indentLevel) + line).join('\n')
}

function valToLua(val, indentLevel) {
    let valStr = ''
    switch (typeof val) {
        case 'string':
            valStr = `'${val}'`
            break;
        case 'number':
            valStr = val.toString();
            break;
        case 'boolean':
            valStr = val ? 'True' : 'False';
            break;
        case 'undefined':
            valStr = 'Nil';
            break;
        case 'object':
            if (val === null) {
                valStr = 'Nil';
            } else if (Array.isArray(val)) {
                valStr = arrToLua(val, indentLevel + 1);
            } else {
                valStr = objToLua(val, indentLevel + 1);
            }
            break;
    }

    return valStr;
}

function getNames(str) {
    const allNames = {};
    const masterMapping = Object.entries(NAME_ALIAS).reduce((mapping, [master, aliases]) => {
        [master, ...aliases].forEach(name => {
            if (allNames[name]) {
                throw Error('别名配置里有重复名字！');
            }
            allNames[name] = true;
        })
        mapping[master] = master;
        aliases.forEach(alias => {
            mapping[alias] = master;
        })
        return mapping;
    }, {});

    var names = str.split('\n').map(x => x.trim()).filter(x => x).filter(x => x !== '见习死亡骑士').map(x => masterMapping[x] || x);
    var exists = {};
    names = names.filter(x => {
        var result = !!exists[x];
        exists[x] = true;
        return !result;
    })

    return names;
}


run()