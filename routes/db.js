var Sequelize = require('sequelize');

const db = {}

var sequelize = new Sequelize('test', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases : true,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  
});

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db



