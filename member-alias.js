const NAME_ALIAS = {
  // '流风吹雪': ['流云舞雪', '皮多多'],
  // '脆皮啼': ['肯帕蕾拉'],
  // '燕归迷你菇': ['兜兜木有猫猫', '蘑了个菇喽'],
  // '抗霸子': ['偷格心', '捡马拉古打天', '晓了显火'],
  // '雪舞幽兰': ['莫兰迪灰', '心无禁忌'],
  // '当时的月亮': ['黑不是我的错', '迷雾卡夫卡', '如果我有暖香', 'Mistkafka'],
  // '猎仁九命': ['光头佬腊肉'],
  // '喝诶黑嘚讴豆': ['Blackbeans'],
  // '佘大宝': ['阿尔法队长', '佘三宝'],
  // '胖胖的包': ['Tranzan'],
  // '周老师': ['丶石老师丶', '红手老师'],
  // '凍顶乌龙': ['指上丶弹冰', '人参乌龙'],
  // 'Sokodayo': ['在偷了在偷了', '在奶了在奶了'],
  // '秋云思月': ['连山之约'],
  // '星夜乱舞': ['星夜火舞'],
  // '暗夜沧海': ['沧海魔神'],
  // '蓝沙小术': ['初见未央', '紫蓝伶'],
  // '黎明挽歌': ['小猪佩刀'],
  // '希水': ['绮罗香'],
  // '星夜乱舞': ['星夜月舞'],
  // '淩淩漆': ['灵灵舞'],
  // '蓝色的梦': ['晓鈈玎']
}


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

module.exports = masterMapping;
