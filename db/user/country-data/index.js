/* eslint-disable @typescript-eslint/no-var-requires */

const languages = ['en', 'hi', 'ur'];

const countryLocalisations = languages.reduce((acc, code) => {
  acc[code] = require(`./${code}.country.json`);
  return acc;
}, {});

module.exports = countryLocalisations;
