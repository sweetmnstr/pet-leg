EXPORT_PORT=8899
IMAGE_NAME=lp-api-dev
CONTAINER_NAME=lp-api-dev-container

aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 956860401796.dkr.ecr.eu-west-2.amazonaws.com

docker pull 956860401796.dkr.ecr.eu-west-2.amazonaws.com/$IMAGE_NAME:latest

if [[ -n $(docker ps --filter "name=${CONTAINER_NAME}" -q) ]]; then
  docker kill $(docker ps --filter "name=${CONTAINER_NAME}" -q)
fi

if [[ -n $(docker ps -a --filter "name=${CONTAINER_NAME}" -q) ]]; then
  docker rm $(docker ps -a --filter "name=${CONTAINER_NAME}" -q)
fi

if [[ -n $(docker images -f 'dangling=true' -q) ]]; then
  docker rmi $(docker images -f 'dangling=true' -q)
fi

docker run -d --network="host" -p$EXPORT_PORT:$EXPORT_PORT --name=$CONTAINER_NAME 956860401796.dkr.ecr.eu-west-2.amazonaws.com/$IMAGE_NAME

nginx -s reload