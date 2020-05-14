import db from './db.js';
import { SYMBOLS } from '../config/app.config.js';
import moment from 'moment-timezone';

import dsService from '../data-sources/index.ds.js';

// batch insert of returns
const createAll = (returnsByAsset) => db.batchInsert('returns', returnsByAsset);

// single row insert
const create = (row) => db('returns').insert(row);

// single row select
const read = (timestamp) =>
  db('returns').select('*').where('timestamp', timestamp).first();

// select all returns
const readAll = () =>
  db.from('returns').select('*').orderBy('timestamp', 'asc');

// select latest returns
const readLatest = () =>
  db('returns').select('*').orderBy('timestamp', 'desc').first();

// update single return
const update = (timestamp, row) =>
  db('returns').where('timestamp', timestamp).update(row);

// delete all returns
const deleteAll = () => db.truncate('returns');

// seed returns table from csv
const seed = async () => {
  console.log('reading seed data');
  const seedRows = await dsService.readSeed();

  console.log(`adding ${seedRows.length} seed rows to db`);
  await createAll(seedRows);
};

// refreshes returns table
const refresh = async () => {
  // most recent row in returns table
  let latestReturns = await readLatest();

  // seed db if latestReturns is undefined
  if (!latestReturns) {
    console.log('db is empty. Seeding from csv');
    await seed();
    latestReturns = await readLatest();
    if (!latestReturns) throw new Error('could not read seed data from csv');
  }

  // timestamp of most recent row
  const latestRefresh = moment(latestReturns.timestamp);

  // days since db refresh
  const daysStale = moment
    .tz('America/New_York')
    .diff(latestRefresh, 'days', true);

  // refresh returns if too stale
  if (daysStale > 1) {
    console.log(`${daysStale} greater than 1. Refreshing returns data`);

    const freshReturns = await dsService.fetchReturns(
      SYMBOLS,
      latestRefresh.subtract(30, 'days'), //buffer to account for market holidays
      moment()
    );

    // insert individual rows to count number  of successful insertions
    let numRefreshed = 0;
    await Promise.all(
      freshReturns.map(async (row) => {
        try {
          await create(row);
          numRefreshed++;
        } catch (error) {
          console.warn('cannot add row. It might already exist');
        }
      })
    );
    console.log('numRefreshed', numRefreshed);

    // return boolean if successful insertions is > 1
    if (numRefreshed > 0) return true;
  }

  return false;
};

export default {
  createAll,
  readAll,
  readLatest,
  deleteAll,
  seed,
  refresh,
};
