FROM node:8.16 as node

WORKDIR /var/www

COPY lib/ lib/
COPY resources/ resources/
COPY routes/ routes/
COPY configs.js configs.js
COPY index.js index.js
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm i --production

ENV NODE_ENV=prod
ENV NODE_PATH=/usr/local/lib/node_modules

CMD ["npm", "run", "start"]
