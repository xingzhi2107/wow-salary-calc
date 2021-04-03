const {storage, storageInitP} = require('./storage');
const CliTable = require('cli-table3');
const _ = require('lodash');

const KEY = 'members';

async function display() {
  await storageInitP();
  const members = await storage.getItem(KEY) || {};

  const membersTable = new CliTable({
    head: ['角色', '子角色'],
  });
  const items = Object.entries(members).map(([master, aliases]) => [master, aliases.join(', ')]);
  membersTable.push(...items);
  console.log(membersTable.toString());
}

async function addMember(member, aliases = []) {
  await storageInitP();
  const members = await storage.getItem(KEY) || {};
  if (members[member]) {
    throw Error('角色已存在');
  }
  members[member] = aliases;
  await storage.setItem(KEY, members);
}

async function addAlias(member, aliases = []) {
}


function checkAlias(members, aliases) {
  const allNames = [...Object.keys(members), ..._.flatten(Object.values(members)), ...aliases];
  if (allNames.length !== _.unionBy(allNames).length) {
    return false;
  } else {
    return true;
  }
}
