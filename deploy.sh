#!/bin/sh
. $HOME/.nvm/nvm.sh
ENV="$NODE_ENV";

cd ./api
git pull origin dev;
git submodule update --remote --init;

sudo docker build -t itemhub-api ./

if [ "$(sudo docker ps -q -f name=itemhub-api)" ]; then
   sudo docker stop itemhub-api
fi
if [ "$(sudo docker container ls -f name=itemhub-api)" ]; then
   sudo docker rm itemhub-api
fi
sudo docker run -d \
   -e ASPNETCORE_URLS=http://\*:8080 -e ASPNETCORE_ENVIRONMENT=prod \
   -p 8099:8080 \
   -p 8883:8883 \
   --name itemhub-api \
   -v /var/project/itemhub/api/appsettings.json:/app/appsettings.json \
   -v /var/project/itemhub/api/secrets.json:/app/secrets.json \
   -v /var/project/itemhub/api/secrets:/app/secrets \
   -v /var/project/itemhub/api/Localization:/app/Localization \
   -v /var/project/itemhub/static:/app/static \
   -v /var/project/itemhub/firmware:/app/firmware \
   itemhub-api

cd ../website
nvm use 16 && npm install && FORCE_UPDATE=false NODE_ENV=$ENV npm run swim-build

cd ../dashboard
nvm use 16 && npm i && npm run build-staging