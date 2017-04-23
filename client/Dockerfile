FROM node:6.9.0
RUN npm install -g yarn
WORKDIR /home/weave
COPY package.json yarn.lock /home/weave/
COPY app /home/weave/app
ENV NPM_CONFIG_LOGLEVEL=warn NPM_CONFIG_PROGRESS=false
RUN yarn --pure-lockfile
RUN npm i -S timely
COPY webpack.local.config.js webpack.production.config.js server.js .babelrc .eslintrc .eslintignore /home/weave/
EXPOSE 4042
CMD ["node", "server.js"]


