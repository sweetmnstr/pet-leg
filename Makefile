.PHONY: init
init:
	echo "init"

.PHONY: db-seed
db-seed:
	echo "db-seed"

.PHONY: db-migrate
db-migrate:
	echo "db-migrate"

.PHONY: dev
dev:
	echo "dev up"

.PHONY: docker-login
docker-login:
	echo "docker login"

.PHONY: build-prod
build-prod:
	echo "build-prod"

.PHONY: build-dev
build-dev:
	echo "build-dev"

.PHONY: docs
docs:
	echo "build-dev"

.PHONY: test
test:
	echo "test"

test-functional: init
	echo "test-functional"

clean:
	echo "clean"

docker-clean:
	docker-compose down
	docker rm -f $(docker ps -a -q)
	docker volume rm $(docker volume ls -q)
