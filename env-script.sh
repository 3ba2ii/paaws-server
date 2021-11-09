#!/bin/sh

touch .env
{
  printf "ENV_SECRET=%sSESSION_REDIS_SECRET_KEY=%s" "$SESSION_REDIS_SECRET_KEY" "ARG_ENV_SECRET_1"
} >> .env