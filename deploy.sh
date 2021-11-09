#!/bin/bash

echo What should the version be?
read VERSION

echo Starte Build Docker Image & Pushing to Docker Hub

docker build -t 3ba2ii/paaws:$VERSION .
docker push 3ba2ii/paaws:$VERSION

echo 🥳 Docker Built Successfully!

echo Starts pulling the image & deploying
ssh root@165.22.16.231 "docker pull 3ba2ii/paaws:$VERSION && docker tag 3ba2ii/paaws:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"

echo 🥳 Deployed Successfully!
