// node_modules imports
import yahooFinance from 'yahoo-finance';
import moment from 'moment-timezone';

const pricesToReturns = (prices) => {
  // munge returns from prices
  let returns = prices.map((e, i) =>
    Object.keys(e).reduce((obj, key) => {
      if (key == 'timestamp') {
        obj.timestamp = e.timestamp;
      } else if (i == 0) {
        obj[key] = 0;
      } else {
        if (prices[i - 1][key] == 0) {
          obj[key] = 0;
        } else {
          obj[key] = e[key] / prices[i - 1][key] - 1;
        }
      }
      return obj;
    }, {})
  );

  // trim first day of zero returns
  returns = returns.slice(1);

  return returns;
};

const dataToPrices = (data) => {
  // munge prices from data
  let prices = [];
  Object.keys(data).forEach((symbol) => {
    const symbolData = data[symbol];
    symbolData.forEach((day) => {
      const formattedDate = moment(day.date)
        .tz('America/New_York')
        .hour(17)
        .toDate();

      const existingRow = prices.find(
        (row) => row.timestamp.getTime() == formattedDate.getTime()
      );

      let formattedSymbol;
      switch (symbol) {
        case 'URTH':
          formattedSymbol = 'stocks';
          break;

        case 'GOVT':
          formattedSymbol = 'bonds';
          break;

        case 'GLD':
          formattedSymbol = 'gold';
          break;

        default:
          throw new Error('invalid name assigned for switch statement');
          break;
      }

      if (existingRow) existingRow[formattedSymbol] = day.adjClose;
      else {
        prices.push({
          timestamp: formattedDate,
          [formattedSymbol]: day.adjClose,
        });
      }
    });
  });

  // reverse array to get prices in ascending order (oldest first)
  prices.reverse();

  return prices;
};

const fetchData = async (symbols, fetchStart, fetchEnd) => {
  // fetch data from yahoo with symbols and start and end date
  const response = await yahooFinance.historical(
    {
      symbols: symbols,
      from: fetchStart,
      to: fetchEnd,
    },
    function (err, quotes) {
      console.error(err);
    }
  );
  return response;
};

const fetchReturns = async (symbols, fetchStart, fetchEnd) => {
  // fetch yahoo data
  const data = await fetchData(symbols, fetchStart, fetchEnd);
  // extract prices from fetched data
  const prices = dataToPrices(data);
  // extract returns from prices
  const returns = pricesToReturns(prices);
  // return the returns
  return returns;
};

export default {
  fetchReturns,
};
