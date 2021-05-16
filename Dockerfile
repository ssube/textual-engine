FROM apextoaster/node:12.22

# copy build output
COPY package.json yarn.lock /app/
COPY data/ /app/data/
COPY out/ /app/out/

WORKDIR /app

# install native modules
RUN yarn install --production

ENTRYPOINT [ "node", "--require", "esm", "/app/out/src/index.js" ]
