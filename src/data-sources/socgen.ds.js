import fetch from 'node-fetch';
import xlsx from 'node-xlsx';
import moment from 'moment-timezone';

// fetch raw data from socgen
const fetchData = async () => {
  // fetch file from socgen
  const response = await fetch(
    'https://wholesale.banking.societegenerale.com/fileadmin/indices_feeds/Trend_Index_Historical.xls'
  );

  // if nothing, socgen is down or file path changed
  if (!response) throw new Error('could not fetch data');

  // extract excel workbook from response
  const workbook = xlsx.parse(new Buffer(await response.arrayBuffer()));

  // extract worksheet from workbook
  const worksheet = workbook[0].data;

  return worksheet;
};

const fetchReturns = async () => {
  const socgenData = await fetchData();

  // munge socgen returns from data
  let socgenReturns = socgenData.map((row, i) => {
    // convert excel date into unix timestamp
    const date = new Date((row[0] - 25568) * 86400 * 1000);
    // convert unix timestamp to moment timezone object. Set time to east coast market close.
    const formattedTime = moment.tz(date, 'America/New_York').hour(17).toDate();
    // return a row of data
    return {
      timestamp: formattedTime,
      futures: Number(row[2]),
    };
  });

  // remove first row without a return
  socgenReturns = socgenReturns.slice(1);

  return socgenReturns;
};

export default {
  fetchReturns,
};
