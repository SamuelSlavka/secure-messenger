const devel_port = 8080;
const port = 8080;
const dbRetryTime = process.env.db_retry_time || 2000;

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const router = require('./router');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


const mongoose = require('mongoose');
const MONGO_PORT = 27017;

const mongoUri = `mongodb://mongo:${MONGO_PORT}/mongo`;
//initialize database
let db = mongoose.connection;
let connectWithRetry = function () {
  return mongoose.connect(mongoUri, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
};

connectWithRetry();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

db.on('error', () => {
	setTimeout(() => {
		console.log('DB connection failed. Will try again.');

		connectWithRetry();
  }, dbRetryTime);
});
//connect to db
db.on('connected', function () {
  
  app.use(router);

  app.listen(port, () => console.log(`All set up. Listening on ${port}!`))
});