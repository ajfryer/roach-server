import { Simulation, calcReturns, calcTotalReturns } from 'portfolio-tools';
import PortfolioAnalytics from 'portfolio-analytics';
import strategyDP from '../data-processing/strategy.dp.js';
import { SYMBOLS } from '../config/app.config.js';

const beforeRun = (dbReturns, stringifiedOptions) => {
  let options = JSON.parse(stringifiedOptions);

  // flatten dbReturns into symbols, returns, & dates arrays
  const symbols = Object.keys(dbReturns[0]).filter((key) => {
    return key !== 'timestamp' && key !== 'id';
  });
  const returns = symbols.map((sym) =>
    dbReturns.reduce((arr, dateData) => {
      arr.push(dateData[sym]);
      return arr;
    }, [])
  );
  const dates = dbReturns.reduce((arr, dateData) => {
    arr.push(dateData['timestamp']);
    return arr;
  }, []);

  // construct full simulation options
  options = {
    ...options,
    dates,
    rebalancePeriod: 126,
    isReturns: true,
    lookbackPeriod: 126,
  };

  return { returns, options };
};

const afterRun = (sim) => {
  // remove initial training data from simulation results
  let dateIndex;
  for (dateIndex = 0; dateIndex < sim.options.dates.length; dateIndex++) {
    if (sim.results.returns[dateIndex] != 0) break;
  }
  sim.results.returns = sim.results.returns.slice(dateIndex);
  sim.options.dates = sim.options.dates.slice(dateIndex);
  sim.results.weightsByAsset = sim.results.weightsByAsset.map((w) =>
    w.slice(dateIndex)
  );
  if (sim.results.returns.length === 0 || sim.options.dates.length === 0)
    throw new Error('Empty nonzero returns/timestamps');

  // calculate summary statistics on remaining simulation results
  sim.results.symbols = SYMBOLS;
  sim.results.equityCurve = calcTotalReturns(sim.results.returns);
  sim.results.CAGR = PortfolioAnalytics.cagr(
    sim.results.equityCurve,
    sim.options.dates
  );
  sim.results.maxDD = PortfolioAnalytics.maxDrawdown(sim.results.equityCurve);
  sim.results.longestDD = PortfolioAnalytics.topDrawdowns(
    sim.results.equityCurve,
    10
  );
  sim.results.VAR = PortfolioAnalytics.valueAtRisk(
    sim.results.equityCurve,
    0.8
  );
};

const run = (dbReturns, stringifiedOptions) => {
  // before run - munge data into correct simulation format
  const { returns, options } = beforeRun(dbReturns, stringifiedOptions);

  // run simulation
  const sim = new Simulation(returns, strategyDP, options);
  sim.run();
  if (!sim.results) throw new Error('no simulation results');

  // after run - annotate results and remove unnecessary results
  afterRun(sim);

  return sim;
};

export default {
  run,
};
