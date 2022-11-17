FROM node:lts-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN chown -R 1000:1000 /root/.npm
USER node

FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/build ./build

RUN chown -R 1000:1000 /root/.npm
USER node

CMD [ "npm", "start" ]
