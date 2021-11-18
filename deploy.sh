#!/bin/bash

echo "🥳 Docker Built Successfully!"

echo "Starts pulling the image & deploying"
ssh root@165.232.117.216 "docker pull 3ba2ii/paaws:latest && docker tag 3ba2ii/paaws:latest dokku/api:latest && dokku deploy api latest"

echo "🥳 Deployed Successfully!"
