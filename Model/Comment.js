const mongoose = require('mongoose');

    const commentschema=new mongoose.Schema({

    postid:{
        type:String
    },
    comment:{
        type:String
    },
    Userid:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',    
        required: true
    },
    date:{
        type:Date
    }
   
});


const comment= mongoose.model('comment', commentschema);
module.exports = comment; 

