const path = require('path');
const fs = require('fs').promises;

const migrationPath = (type, dirname = __dirname, filename = __filename) => {
  const parsed = path.parse(filename);
  return path.join(parsed.dir, type, parsed.name + '.sql');
};

exports.up = async (knex) => {
  const sql = await fs.readFile(migrationPath('up'), 'utf-8');
  return knex.raw(sql);
};

exports.down = async (knex) => {
  const sql = await fs.readFile(migrationPath('down'), 'utf-8');
  return knex.raw(sql);
};
