/* eslint-disable-next-line unicorn/filename-case */
const path = require('path');
const fs = require('fs-extra');

exports.up = async (knex) => {
  const filepath = path.join(__dirname, `up.sql`);
  const sql = await fs.readFile(filepath, { encoding: 'utf-8' });
  return knex.raw(sql);
};

exports.down = async (knex) => {
  const filepath = path.join(__dirname, `down.sql`);
  const sql = await fs.readFile(filepath, { encoding: 'utf-8' });
  return knex.raw(sql);
};
