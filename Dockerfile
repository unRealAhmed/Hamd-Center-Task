FROM node:20

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn global add @nestjs/cli
RUN yarn install

COPY . .

RUN yarn build

EXPOSE 8000

CMD ["yarn", "start:prod"]