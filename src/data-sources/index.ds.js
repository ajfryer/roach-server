// node_modules imports
import path from 'path';
import csv from 'csv/lib/sync.js';
import fs from 'fs';
import moment from 'moment-timezone';

// project imports
import yahooDS from './yahoo.ds.js';
import socgenDS from './socgen.ds.js';

// read seed data from local csv
export const readSeed = async () => {
  // filepath from src/data-sources
  const filePath = path.join(
    process.cwd(),
    '/src/data-sources/',
    'seed-returns.csv'
  );

  // load csv
  const csvData = await fs.promises.readFile(filePath);

  // parse csv
  const data = csv.parse(csvData);

  // extract rows from parsed data
  const rows = data.slice(1).map((d) => ({
    timestamp: moment
      .tz(d[0], 'America/New_York')
      .hour(17)
      .format('YYYY-MM-DD HH:mm:SSZZ'),
    stocks: d[1],
    bonds: d[2],
    gold: d[3],
    futures: d[4],
  }));

  return rows;
};

// fetch incremental refresh data from yahoo and SocGen
export const fetchReturns = async (symbols, fetchStart, fetchEnd) => {
  // fetch fresh yahooReturns
  const yahooReturns = await yahooDS.fetchReturns(
    symbols.slice(0, symbols.length - 1),
    moment.tz(fetchStart, 'America/New_York').format('YYYY-MM-DD'),
    moment.tz(fetchEnd, 'America/New_York').format('YYYY-MM-DD')
  );

  // fetch fresh socgenReturns
  const socgenReturns = await socgenDS.fetchReturns();

  // combine yahooReturns and socgenReturns together
  const combinedReturns = [];
  socgenReturns.forEach((day, i) => {
    const existingRow = yahooReturns.find(
      (row) => row.timestamp.getTime() == day.timestamp.getTime()
    );
    if (existingRow)
      combinedReturns.push({
        ...existingRow,
        futures: day.futures,
      });
  });

  return combinedReturns;
};

export default {
  readSeed,
  fetchReturns,
};
