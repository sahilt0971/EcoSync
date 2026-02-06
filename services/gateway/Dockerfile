FROM node:22-alpine

RUN apk update && apk upgrade

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
