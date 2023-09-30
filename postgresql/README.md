Here is a fake database dump without any sensitive information, which is binded into '/docker-entrypoint-initdb.d' through the docker-compose file,
into postgresql container so that if '/var/lib/postgresql/data' is empty, postgresql initdb calls .sh and .sql files into it. It permits postgresql to
import the .sql dump I put inside this directory at the first build so that the database and its docker volume is provisioned.
