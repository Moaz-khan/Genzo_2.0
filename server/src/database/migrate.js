import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

async function runMigration() {
  console.log('--- Starting TiDB Migration for GENZO SILVER ---');
  console.log(`Connecting to ${process.env.DB_HOST}:${process.env.DB_PORT}...`);

  let initConn;
  try {
    initConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
      port: Number(process.env.DB_PORT) || 4000,
      user: process.env.DB_USER || '44i85yZnWWhMnDD.root',
      password: process.env.DB_PASSWORD || 'oJPkHKIlK3FO69y2',
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
      connectTimeout: 60000,
    });

    const targetDb = process.env.DB_NAME || 'genzo_silver';
    await initConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${targetDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`Database '${targetDb}' ensured.`);
    await initConn.end();
  } catch (err) {
    console.warn(`Database check notice: ${err.message}`);
    if (initConn) await initConn.end();
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
    port: Number(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER || '44i85yZnWWhMnDD.root',
    password: process.env.DB_PASSWORD || 'oJPkHKIlK3FO69y2',
    database: process.env.DB_NAME || 'genzo_silver',
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
    connectTimeout: 60000,
    multipleStatements: true,
  });

  try {
    const rawSql = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf-8');

    // Remove comments
    const cleanSql = rawSql
      .replace(/--.*$/gm, '')
      .replace(/\r\n/g, '\n')
      .trim();

    const statements = cleanSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`Found ${statements.length} table creation / DDL statements.`);

    for (const statement of statements) {
      console.log(`Executing: ${statement.split('\n')[0].substring(0, 60)}...`);
      await connection.query(statement);
    }

    console.log('\nAll tables created successfully in TiDB!');

    const [tables] = await connection.query('SHOW TABLES');
    console.log('\nVerified tables in TiDB database:');
    tables.forEach((row) => {
      console.log(` [✓] ${Object.values(row)[0]}`);
    });
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
    console.log('--- Migration Finished ---');
  }
}

runMigration();
