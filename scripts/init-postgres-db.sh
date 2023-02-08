#!/bin/bash
# Refer https://hub.docker.com/_/postgres/  How to extend this image, to add an additional user and database
set -e
set -u

if [ -z "$POSTGRES_DB" ]; then
	echo "Creating database: $POSTGRES_DB"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
      CREATE DATABASE $POSTGRES_DB;
      GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOSQL
	echo "Database $POSTGRES_DB created"
fi
