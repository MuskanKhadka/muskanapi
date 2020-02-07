const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const userschema = new mongoose.Schema({
    userFullname: { 
        type: String },
    email: { 
        type: String },
    username: { 
        type: String },
    password: { 
        type: String },
    image: { type: String },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }]
});
userschema.statics.checkCrediantialsDb = async (username, password) => {
    const usercheck = await User.findOne({ username: username, password: password })
    if (usercheck) {
        return usercheck;
    } else {
        return false;
    }

};
userschema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, 'Destination Nepal')
    console.log(token);
    user.tokens = user.tokens.concat({ token: token })
    await user.save();
    return token;
}

const User = mongoose.model('User', userschema);
module.exports = User;  