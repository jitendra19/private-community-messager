const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    message: {type: String},
    key: {type: String},
    timestamp: {type: Number}
});

const Chat_message = mongoose.model('chat_message', MessageSchema);
module.exports = Chat_message;