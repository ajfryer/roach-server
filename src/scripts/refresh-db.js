const dbService = require('../database/index.db.js');

const refreshDb = async () => {
  await dbService.refresh();
  process.exit(0);
};

refreshDb().catch((e) => {
  console.error(e);
  process.exit(1);
});
