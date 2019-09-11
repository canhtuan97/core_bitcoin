const db = require('../routes/db.js')
var Sequelize = require('sequelize');



module.exports  = db.sequelize.define('user', {
  iduser: {
    type: Sequelize.INTEGER,
    primaryKey : true,
    autoIncrement :true
  },
  name: {
    type: Sequelize.STRING
  },
  pass: {
  	type: Sequelize.STRING
  }
}, {
  freezeTableName: true // Model tableName will be the same as the model name
});




