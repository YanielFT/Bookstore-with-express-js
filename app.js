const http = require("http");
const express = require("express");
const bodyParsed = require("body-parser");
const path = require("path");
const errorController = require("./controllers/error");
const { mongoConnect } = require("./util/database");

const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParsed.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("67fd680b8292003f66fd2942")
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorController.notFound);

const server = http.createServer(app);

mongoConnect(() => {
  app.listen(3000);
});
