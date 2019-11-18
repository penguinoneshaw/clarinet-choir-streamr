const mongoose = require('mongoose');
const bCrypt = require('bcrypt-nodejs');

const isValidPassword = (user, password) => {
    return bCrypt.compareSync(password,user.password);
};

const hashPassword = (password) => {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

module.exports = {User: mongoose.model('User', {
    username: String,
    password: String,
    admin: Boolean
}), isValidPassword, hashPassword};