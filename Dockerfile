FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
#COPY yarn*.json ./

RUN yarn

RUN mkdir - p node_modules / .cache && chmod - R 777 node_modules / .cache

COPY . .


COPY .env.production .env

RUN yarn build

ENV NODE_ENV production

RUN npm config set unsafe - perm true

EXPOSE 8080
CMD [ "node", "dist/index.js" ]
USER node