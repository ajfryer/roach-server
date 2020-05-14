import express from 'express';
import cors from 'cors';
import dbService from '../database/index.db.js'; //database service
import dpService from '../data-processing/index.dp.js'; // data processing service

import moment from 'moment-timezone';

import { dbRefreshTime } from '../config/app.config.js';

const portfolioRouter = express.Router();

portfolioRouter.use(cors());

/* 
  api/portfolio/roach
  ?rebalance (int)
*/
portfolioRouter.route('/roach').get(async (req, res, next) => {
  try {
    // invalid query params if not equalWeight or minimumVariance
    if (
      req.query.strategy !== 'equalWeight' &&
      req.query.strategy !== 'minimumVariance'
    ) {
      res.statusMessage = 'invalid query params dawg';
      return res.status(400).end();
    }

    //primary key from query
    const key = JSON.stringify({
      strategy: String(req.query.strategy),
    });

    //get row from db
    const roach = await dbService.portfolioDB.read(key);

    //if no row found, throw error
    if (!roach) throw new Error('roach portfolio not found');

    // enable client-side caching
    res.set('Cache-Control', 'public, max-age=' + secondsToExpiration());

    // return portfolio simulation
    res.json(roach);
  } catch (error) {
    next(error);
  }
});

/* 
  api/portfolio/benchmark
  ?weights (array)
*/
portfolioRouter.route('/benchmark').get(async (req, res, next) => {
  try {
    const weights = req.query.weights
      .split(',')
      .map((weight) => Number(weight));

    // invalid query params if rounded sum of query params !== 1
    if (
      Math.round(10000 * weights.reduce((tot, cur) => tot + cur, 0)) / 10000 -
        1 !==
      0
    ) {
      res.statusMessage = 'invalid query params';
      return res.status(400).end();
    }

    //primary key from query
    const key = JSON.stringify({
      weights: weights,
    });

    // read from portfolio table
    let benchmark = await dbService.portfolioDB.read(key);

    // if portfolio doesn't exist, run simulation, add to db, and then read
    if (!benchmark) {
      // get all from returns table
      let dbReturns = await dbService.returnsDB.readAll();

      // run simulation
      const simulation = dpService.SimulatorDP.run(dbReturns, key);

      // stringify simulation results into new db row
      const dbRow = [
        {
          key: key,
          value: JSON.stringify({
            options: simulation.options,
            results: simulation.results,
          }),
        },
      ];

      // insert new simulation into the db
      await dbService.portfolioDB.createAll(dbRow);

      // get new simulation
      benchmark = await dbService.portfolioDB.read(key);

      if (!benchmark) throw new Error('benchmark portfolio not found');
    }

    // enable client-side caching
    res.set('Cache-Control', 'public, max-age=' + secondsToExpiration());

    // return
    res.json(benchmark);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// client-side caching expiration helper function
const secondsToExpiration = () => {
  const expires = moment.tz(dbRefreshTime, ['H:m:s'], 'UTC').add(1, 'day');
  const now = moment();
  return parseInt(expires.diff(now, 's'));
};

// export router
export default portfolioRouter;
