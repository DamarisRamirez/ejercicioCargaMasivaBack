const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const connection = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: 5432,
});

const getConnection = async () => await connection;

module.exports = {
  getConnection,
};
