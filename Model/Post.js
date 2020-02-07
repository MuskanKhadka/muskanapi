const mongoose = require('mongoose');
const postschema = new mongoose.Schema({

    Userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String
    },
    destination: {
        type: String,
    },
    postdate: {
        type: Date
    },
    image: {
        type: String
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    count: {
        type: Number,
        default: 0
    }
});

const post = mongoose.model('Post', postschema);
module.exports = post;

