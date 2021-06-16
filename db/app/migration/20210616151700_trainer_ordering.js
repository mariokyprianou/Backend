/* eslint-disable-next-line unicorn/filename-case */
const path = require('path');
const fs = require('fs-extra');

exports.up = async (knex) => {
  const updir = path.resolve(__dirname, 'up');
  const filename = path.basename(__filename, '.js');
  const filepath = path.join(updir, `${filename}.sql`);
  const sql = await fs.readFile(filepath, { encoding: 'utf-8' });
  return knex.raw(sql);
};

exports.down = async (knex) => {
  const downdir = path.join(__dirname, 'down');
  const filename = path.basename(__filename, '.js');
  const filepath = path.join(downdir, `${filename}.sql`);
  const sql = await fs.readFile(filepath, { encoding: 'utf-8' });
  return knex.raw(sql);
};
