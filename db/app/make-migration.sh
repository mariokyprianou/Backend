#!/bin/bash

mkdir -p db/app/migration/up
mkdir -p db/app/migration/down


MIGRATION_NAME=$1
MIGRATION_FILE=$(npx knex migrate:make $MIGRATION_NAME --knexfile db/app/knexfile.js | grep 'Created Migration: ' | awk '{ print $3 }')
MIGRATION_BASENAME=$(basename ${MIGRATION_FILE%.js})

cat > $MIGRATION_FILE << EOF
/* eslint-disable-next-line unicorn/filename-case */
const path = require('path');
const fs = require('fs-extra');

exports.up = async knex => {
  const updir = path.resolve(__dirname, 'up');
  const filename = path.basename(__filename, '.js');
  const filepath = path.join(updir, \`\${filename}.sql\`);
  const sql = await fs.readFile(filepath, { encoding: 'utf-8' });
  return knex.raw(sql);
};

exports.down = async knex => {
  const downdir = path.join(__dirname, 'down');
  const filename = path.basename(__filename, '.js');
  const filepath = path.join(downdir, \`\${filename}.sql\`);
  const sql = await fs.readFile(filepath, { encoding: 'utf-8' });
  return knex.raw(sql);
};
EOF

echo "Creating file: db/app/migration/up/$MIGRATION_BASENAME.sql"
touch db/app/migration/up/$MIGRATION_BASENAME.sql

echo "Creating file: db/app/migration/down/$MIGRATION_BASENAME.sql"
touch db/app/migration/down/$MIGRATION_BASENAME.sql
