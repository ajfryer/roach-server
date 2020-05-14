// node_modules imports
import PortfolioAllocation from 'portfolio-allocation';
import { Strategy } from 'portfolio-tools';

const calcWeights = (dateIndex, returnsByAsset, options) => {
  // initialize weights to zero
  let weightByAsset = Array(returnsByAsset.length).fill(0);

  // return zero weights if date is before lookback period
  if (dateIndex + 1 < options.lookbackPeriod) return weightByAsset;

  // set weightByAsset according to strategy
  if (options.weights) weightByAsset = options.weights;
  else if (options.strategy) {
    switch (options.strategy) {
      // if strategy is equal weight
      case 'equalWeight':
        weightByAsset = Array(returnsByAsset.length).fill(
          1 / returnsByAsset.length
        );
        break;

      // if strategy is minimum variance
      case 'minimumVariance':
        // slice returns to covariance measuring period
        returnsByAsset = returnsByAsset.map((e) =>
          e.slice(dateIndex + 1 - options.lookbackPeriod, dateIndex + 1)
        );

        // estimate sample covariance matrix
        let covarianceMatrix = PortfolioAllocation.sampleCovarianceMatrix(
          ...returnsByAsset
        );

        // set weights according to minimum variance optimization
        weightByAsset = PortfolioAllocation.globalMinimumVarianceWeights(
          covarianceMatrix,
          {
            constraints: {
              maxWeights: [0.25, 0.25, 1, 1],
              minWeights: [0, 0, 0.1, 0.1],
            },
          }
        );
        break;

      default:
        throw new Error('invalid strategy name');
        break;
    }
  }

  // use simplex alorithm to roundweights to 1
  weightByAsset = PortfolioAllocation.roundedWeights(weightByAsset, 100);

  // return calculated weight by asset
  return weightByAsset;
};

const validateOptions = (options, returnsByAsset) => {
  // validate lookback period
  if (
    typeof options.lookbackPeriod !== 'number' ||
    options.lookbackPeriod < 1 ||
    options.lookbackPeriod >= returnsByAsset[0].length
  )
    throw new Error('invalid period ' + options.period);

  // validate rebalance period
  if (
    typeof options.rebalancePeriod !== 'number' ||
    options.rebalancePeriod < 1 ||
    !Number.isInteger(options.rebalancePeriod) ||
    options.rebalancePeriod >= returnsByAsset[0].length
  )
    throw new Error('invalid rebalancePeriod ' + options.rebalancePeriod);
};

const validateContext = () => {};

export default new Strategy(calcWeights, validateOptions, validateContext);
