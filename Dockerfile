FROM node:carbon

# Install global dependencies that we need
RUN npm install -g yarn jest
RUN chmod +x /usr/local/lib/node_modules/yarn/bin/yarn.js

EXPOSE 9000

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app
COPY yarn.lock /app
RUN yarn
