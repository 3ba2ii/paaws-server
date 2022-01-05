#!/bin/bash

echo "🥳 Docker Built Successfully!"

echo "Starts pulling the image & deploying"
ssh root@46.101.205.140 "docker pull 3ba2ii/paaws:latest && docker tag 3ba2ii/paaws:latest dokku/api:latest && dokku deploy api latest"

echo "🥳 Deployed Successfully!"
