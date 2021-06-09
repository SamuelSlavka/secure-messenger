FROM node:12.2.0-alpine as build
# Create app directory
WORKDIR /usr/src
# Install app dependencies
COPY package*.json ./

RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
    && npm install \
    && apk del .gyp
# Copy app source code
COPY . .

#Expose port and start application
EXPOSE 3000
CMD ["npm", "start"]
