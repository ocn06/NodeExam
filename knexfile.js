//Configuration information for mySQL databse


const credentials = require("./mysql_config/mysql_credentials_local.js");

module.exports = {

  development: {
    client: 'mysql2',
    connection: {
      host: credentials.host,
      database: credentials.database,
      user:     credentials.user,
      password: credentials.password
    }
  }
};