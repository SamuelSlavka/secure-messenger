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

#Build frontend
RUN npm run build

# # stage 2
FROM nginx:1.16.0-alpine
COPY --from=build /usr/src/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]