FROM node:10-alpine

WORKDIR /daas

COPY ./dist/* .

RUN apk update
RUN yarn install --production=true

CMD ["node","/daas/index.ts"]
