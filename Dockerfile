FROM node:10-alpine AS buildStage
# WORKDIR /daas
COPY . .
# RUN yarn add global gulp
RUN yarn install
# RUN yarn test
RUN yarn build

FROM node:10-alpine
WORKDIR /daas
COPY --from=buildStage /dist/ /daas/
COPY package.json .
COPY yarn.lock .
RUN apk --no-cache update
RUN yarn install --production=true
CMD ["node","/daas/index.js"]
