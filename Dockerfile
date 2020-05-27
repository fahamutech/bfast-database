FROM node:10-alpine AS buildStage
WORKDIR /daas
COPY package.json .
COPY yarn.lock .
COPY gulpfile.js .
COPY tsconfig.json .
RUN yarn add global gulp
RUN yarn install
RUN yarn test
RUN yarn build

FROM node:10-alpine
WORKDIR /daas
COPY --from=buildStage /daas/dist/ /daas/
COPY package.json .
COPY yarn.lock .
RUN apk --no-cache update
RUN yarn install --production=true
CMD ["node","/daas/index.js"]
