FROM node:9

WORKDIR /srv
COPY package.json /srv/
COPY yarn.lock /srv/
RUN yarn install
COPY .babelrc /srv/
COPY src /srv/src

CMD yarn run docker
