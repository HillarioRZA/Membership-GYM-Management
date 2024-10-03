const Sequelize = require("sequelize");
const sequelize = new Sequelize("2dr3_fitnes_aerobic", "root", "", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  logging: false,
});

module.exports = sequelize;
