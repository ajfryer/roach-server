import dotenv from 'dotenv';
dotenv.config();
import knex from 'knex';
import pg from 'pg';

import env from '../config/env.config.js';

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => {
  return parseFloat(value);
});

// create knex postgres db instance used for injection
export default knex({
  client: 'pg',
  connection: env.DATABASE_URL,
});
