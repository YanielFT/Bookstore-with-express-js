const http = require("http");
const express = require("express");
const bodyParsed = require("body-parser");
const path = require("path");
const errorController = require('./controllers/error')
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParsed.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorController.notFound);
const server = http.createServer(app);

server.listen(3000);
