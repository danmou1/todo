SELECT 'CREATE DATABASE taskman_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mydb')