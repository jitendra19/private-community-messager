const http = require("http");
const express = require("express");
const socket = require("socket.io");
var cors = require('cors');
const path = require('path');
const fetch = require("node-fetch");
const mongoose = require('mongoose');

const {produce, sendMessage} = require("./produce");
const consume = require("./consume");

const message = require('./models/message.js');
const url = 'mongodb+srv://mongodb:mongodb@cluster0.v9oir.mongodb.net/private_communtiy?retryWrites=true&w=majority';

mongoose.set('debug', true);
mongoose.connect(url, {
   useUnifiedTopology: true,
   useNewUrlParser: true
});
mongoose.connection.on('connected', ()=> {
    console.log('connected with DB');
});
mongoose.connection.on('error', (error)=> {
    console.log('error - ', error);
});

require('dotenv').config();

const app = express();

app.get('/api/analytics', (req, res)=>{
    let query;
    console.log(new Date().getTime()-60)
    console.log(req.query);
    if(req.query && req.query.per) {
        switch(req.query.per) {
            case 'username':
                query = {username: {$regex: '.*(?i)' + req.query.value + '(?-i).*'}};
                break;
            case 'minute':
                query = {'timestamp':{'$gte': (new Date().getTime() - (60)) }};
                break;
            case 'hour':
                query = {'timestamp':{'$gte': (new Date().getTime()-(60*60))}};
                break;
            case 'day':
                query = {'timestamp':{'$gte': (new Date().getTime()-(60*60*24))}};
                break;
            default:
                query= {'timestamp':{'$gte': 1630588961}};
                break;
        }
    }
    message.countDocuments(query).lean().exec(function(err, doc) {
        res.json(doc);
    });
});

app.use(cors());
app.use(express.json({ limit: '50kb' }));

const port = process.env.PORT || 8000;
const server = http.createServer(app);
const io = socket(server);

users = [];
ids = [];
connections = [];

io.on("connection", socket => {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length)

    socket.emit("your_id", socket.id);
    ids.push(socket.id);

    // New user
    socket.on('new user', body => {
        socket.username = body.Username;
        users.push(socket.username);
        updateUsernames();
    });

    // Client send message, emit server
    socket.on("send message", message => {
        io.emit("message", message);
        sendMessage(message);
    });

    // Client disconnect
    socket.on('disconnect', body => {
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });

    // Update list of users
    let updateUsernames = async () => {
        io.sockets.emit('get_users', users);
    }
});

app.use(express.static('../client/build'));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
})

// call the `produce` function and log an error if it occurs
produce().catch((err) => {
	console.error("error in producer: ", err);
});

// start the consumer, and log any errors
consume().catch((err) => {
	console.error("error in consumer: ", err);
});

server.listen(port, () => console.log(`server is running on port ${port}`));