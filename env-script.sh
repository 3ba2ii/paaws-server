#!/bin/sh

touch .env
{
  printf "ENV_SECRET=%sENV_SECRET_1=%s" "$ARG_ENV_SECRET" "ARG_ENV_SECRET_1"
} >> .env