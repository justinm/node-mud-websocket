FROM node:9

ENV PORT=4000
EXPOSE 4000

WORKDIR /srv

COPY package.json /srv/
COPY yarn.lock /srv/
COPY .babelrc /srv/

RUN yarn install

COPY src /srv/src

CMD yarn run docker
