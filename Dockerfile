FROM node:12.21.0

RUN apt-get update && apt-get install -y \
  dumb-init \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g forever
RUN mkdir /app
COPY docker/run.sh /app
RUN chmod +x /app/run.sh
COPY package.json /app
WORKDIR /app
RUN npm install --production
RUN npm install cross-env

COPY index.js /app

EXPOSE 80

CMD ["dumb-init", "./run.sh"]
