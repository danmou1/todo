DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'taskman_dev') THEN
        CREATE DATABASE taskman_dev;
    END IF;
END $$