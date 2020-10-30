const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const app = express();
const log4js = require('log4js');

const db = require("./db/db-config");

db.sequelize.sync({force: false}).then(() => {
    console.log("Synchronizing Database...");
});

app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 50000 }))

const routes = require("./route/app-route");
routes(app);

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port, ()=>{
    console.log(`Server started on port ${port}`);
});
