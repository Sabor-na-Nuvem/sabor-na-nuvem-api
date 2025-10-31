FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x /app/entrypoint.sh

RUN npx prisma generate

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]

CMD [ "npm", "run", "dev" ]
