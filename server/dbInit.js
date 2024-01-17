const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'taskman_dev',
    password: '071511',
    port: 5432,
});

async function runMigrations() {
    const migrationDir = path.join(__dirname, 'sql', 'migrations');
  
    try {
      const client = await db.connect();
  
      try {
        const migrationFiles = fs.readdirSync(migrationDir).sort();

        for (const fileName of migrationFiles) {
          const filePath = path.join(migrationDir, fileName);
          const migrationFile = fs.readFileSync(filePath, 'utf8');
  
          await client.query(migrationFile);
  
          console.log(`Executed migration: ${fileName}`);
        }
  
        console.log('All migrations executed successfully.');
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error running migrations:', error);
    } finally {
      // Close the pool to end the process
      db.end();
    }
};

runMigrations();