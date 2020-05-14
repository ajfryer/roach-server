import returnsDB from './returns.db.js';
import portfolioDB from './portfolio.db.js';

export const refresh = async () => {
  // try to refresh returns table
  const returnsDidRefresh = await returnsDB.refresh();
  // if returns table refreshes, refresh portoflio table
  if (returnsDidRefresh) await portfolioDB.refresh();
};

export default {
  refresh,
  returnsDB,
  portfolioDB,
};
