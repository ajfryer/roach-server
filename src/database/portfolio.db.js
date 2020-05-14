import db from './db.js';
import returnsDB from './returns.db.js';
import simulatorDP from '../data-processing/simulator.dp.js';
import { DEFAULT_SIMS_OPTIONS } from '../config/app.config.js';

//CRUD

const createAll = (rows) => db('portfolio').insert(rows);

const read = (key) => db('portfolio').select('*').where('key', key).first();

const readAll = () => db.from('portfolio').select('*');

const readLatest = () => {};

const deleteAll = () => db.truncate('portfolio');

export const refresh = async () => {
  // truncate portfolios table
  await deleteAll();

  // get all rows from returns table
  let dbReturns = await returnsDB.readAll();

  // run default simulations with default Options from config
  let defaultSims = DEFAULT_SIMS_OPTIONS.map((o, i) =>
    simulatorDP.run(dbReturns, JSON.stringify(o))
  );

  // create new rows for portfolios table
  const dbRows = defaultSims.map((sim, i) => ({
    key: JSON.stringify(DEFAULT_SIMS_OPTIONS[i]),
    value: JSON.stringify({
      options: sim.options,
      results: sim.results,
    }),
  }));

  // insert new simulations into the db
  await createAll(dbRows);
};

export default {
  createAll,
  read,
  readAll,
  readLatest,
  deleteAll,
  refresh,
};
