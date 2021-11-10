FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY yarn*.json ./

RUN yarn

COPY . .

ARG SESSION_REDIS_SECRET_KEY=
ARG TWILIO_ACCOUNT_SID=
ARG TWILIO_AUTH_TOKEN=
ARG SENDGRID_API_KEY=
ARG APP_URL=
ARG GOOGLE_MAPS_API_KEY=
ARG CORS_ORIGIN=


#COPY .env.production .env

RUN yarn build

ENV NODE_ENV production

EXPOSE 8080
CMD [ "node", "dist/index.js" ]
USER node