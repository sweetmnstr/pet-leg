## Framework Documentation

[Nest](https://github.com/nestjs/nest)

## Installation

1. install postgresql 
2. create local database 
3. create user for database
4. create local .env file, fill out file according to tmp.env template 

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

#### Clean restart container

```bash
$ docker-compose down

$ docker rm -f $(docker ps -a -q)

$ docker volume rm $(docker volume ls -q)

$ docker-compose up -d
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## License

Nest is [MIT licensed](LICENSE).
