#!/bin/bash

#kill old container
docker stop dss
docker rm dss
docker rmi -f dss

#build new container
docker build -t dss .
docker run -id --env-file=.env --name dss -p 3100:3000 dss
