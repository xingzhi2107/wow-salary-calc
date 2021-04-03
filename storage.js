const NodeStorage = require('node-persist');

const storage = NodeStorage.create({
  dir: '/Users/zhenguo/.cache/wow-salary/'
});

const storageInitP = storage.init();

module.exports = {
  storage,
  storageInitP,
}
