const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const { createServer } = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;
const DB_CONNECTION = process.env.DB_CONNECTION || 'mongodb://localhost:27017/millonario';

global.structuredClone = (val) => JSON.parse(JSON.stringify(val))

// Middlewares
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Socket io
const httpServer = createServer(app);
const io = new Server(httpServer, {});

io.on("connection", (socket) => {
    console.log('user has connected');
    socket.join('room1');
    app.set("socket", socket);
});

//app.set('socketio', io);

// Import Routes
const playRoute = require('./routes/play');
const questionRoute = require('./routes/questions');

// Routes Middlewares
app.use('/', playRoute);
app.use('/api', questionRoute);

// Connect to db
mongoose.connect(DB_CONNECTION, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Listen to server
//app.listen(PORT, () => console.log('Listening on http://localhost:'+PORT));
httpServer.listen(PORT, () => console.log('Listening on Port: '+PORT));