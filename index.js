import express, { json } from "express";
import mysql from "mysql2";
import router from "./router.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
const loadJSON = (path) =>
  JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const swaggerDocument = loadJSON("./swagger.json");

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "mysqldb",
  user: process.env.DB_USER || "root",
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || "shoes_innodb",
  password: process.env.DB_PASSWORD || 12345678,
});

const PORT = process.env.SERVER_PORT || 3000;
const app = express();

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api", router);
app.use("/", function (req, res) {
  res.redirect("/api-docs");
});
async function startApp() {
  try {
    connection.connect();
    console.log("Подключение к серверу MySQL успешно установлено");
    app.listen(PORT, () => console.log("server started on port: " + PORT));
  } catch (error) {
    console.log(error);
  }
}

startApp();

export default connection;
