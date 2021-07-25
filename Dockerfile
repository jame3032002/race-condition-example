FROM node:16.4.1-alpine

WORKDIR /app
COPY ./package.json .
RUN npm install
COPY . .

ENTRYPOINT ["npm"]
CMD ["run", "start"]