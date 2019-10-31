/* ENV */
require('dotenv').config();

/*  DEPENDENCIES */
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT;
const host = process.env.HOST;

app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Node의 native Promise 사용
mongoose.Promise = global.Promise;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { })
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => console.error(e));

// index
app.get('/', (req, res) => res.send('CHMS'));

// ROUTERS
app.use('/auth', require('./routes/auth'));
app.use('/user', require('./routes/users'));
app.use('/project', require('./routes/projects/projects'));
app.use('/mileage', require('./routes/mileage'));

app.listen(port, host, () => console.log(`Server listening on port ${port}`));