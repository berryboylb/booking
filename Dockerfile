FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /booking

COPY  package.json ./

RUN pnpm install

COPY . .

RUN npx prisma generate

EXPOSE 8000
