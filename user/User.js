const Sequelize = require("sequelize");
const connection = require("../database/database");

const User = connection.define('users', {
    title:{
        type: Sequelize.STRING,
        allowNull: false
    },slug:{
        type: Sequelize.STRING,
        allowNull: false
    }
})

// User.sync({force: true});

module.exports = User;