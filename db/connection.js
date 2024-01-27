const fs = require('fs').promises;
const path = require('path');
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'taskman_dev',
  password: '071511',
  port: 5432
});

const migrationDir = path.join(__dirname, './sql/migrations');

async function initializeDatabase() {
  try {
    await client.connect();
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

async function runMigrations() {
  try {
    const migrationFiles = (await fs.readdir(migrationDir)).sort();

    for (const fileName of migrationFiles) {
      const filePath = path.join(migrationDir, fileName);
      const migrationFile = await fs.readFile(filePath, 'utf-8');

      try {
        await client.query(migrationFile);
        console.log(`${fileName}: executed migration`);
      } catch (error) {
        if (error.code === '42P07') {
          console.log(`${fileName}: table already exists`);
        } else {
          console.error(`${fileName}:`, error.message, error.code);
        }
      }
    }

    console.log('All migration files executed successfully');
  } catch (error) {
    console.error(error.message, error.code);
  }
}

async function closeDatabaseConnection() {
  try {
    await client.end();
    console.log('Closed the database connection');
  } catch (error) {
    console.error('Error closing the database connection:', error.message);
  }
}

module.exports = {
  initializeDatabase,
  runMigrations,
  closeDatabaseConnection,
  getClient: () => client,
};