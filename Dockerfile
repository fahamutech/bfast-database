FROM node:10-alpine

WORKDIR /daas

COPY ./dist/ /daas/

COPY package.json .
COPY yarn.lock .

#RUN apk update
RUN yarn install --production=true

CMD ["node","/daas/index.js"]
