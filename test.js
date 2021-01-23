var salaryCalculator = require('./index');

async function run() {
  await salaryCalculator.loadWclP;
  salaryCalculator.display();
  salaryCalculator.saveMemberSalariesToFiles();
}
run();
