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
  '周老师': ['丶石老师丶'],
  '凍顶乌龙': ['指上丶弹冰'],
  'Sokodayo': ['在偷了在偷了', '在奶了在奶了']
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
