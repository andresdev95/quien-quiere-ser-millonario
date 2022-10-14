const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const DB_CONNECTION = process.env.DB_CONNECTION || 'mongodb://localhost:27017/millonario';

global.structuredClone = (val) => JSON.parse(JSON.stringify(val))

//require('dotenv/config');

// Middlewares
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Import Routes
const questionRoute = require('./routes/questions');

// Routes Middlewares
app.use('/api', questionRoute);

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/play', (req, res) => {
    res.render('play');
});

// Connect to db
mongoose.connect(DB_CONNECTION, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Listen to server
app.listen(PORT, () => console.log('Listening on http://localhost:'+PORT));
