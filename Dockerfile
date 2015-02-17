FROM node:0.10
ADD . /
EXPOSE 3333
CMD node app.js --env=development