FROM darrensiegel/frontend-base:latest

EXPOSE 9000

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app
COPY yarn.lock /app
RUN yarn
