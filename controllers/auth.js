const User = require("../models/user");
const bcryptjs = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yanielfuentes02@gmail.com", // Reemplázalo con tu dirección de Gmail
    pass: "will nori iamc ogrw", // Usa una contraseña generada con "App Passwords"
  },
});

exports.getLogin = async (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: req.flash("error"),
  });
};

exports.getSignup = async (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: req.flash("error"),
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
};

exports.postSignup = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array(),
      oldInput: { email, password, confirmPassword },
    });
  }

  if (password !== confirmPassword) {
    req.flash("error", "The password doesn´t match");
    return res.redirect("/signup");
  }
  const hash = await bcryptjs.hash(password, 12);
  const newUser = new User({ email, password: hash, cart: { items: [] } });
  try {
    await newUser.save();
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
  res.redirect("/login");
  try {
    return transporter.sendMail({
      to: email,
      from: "ceyfuentes@gmail.com",
      subject: "Signup succeeded",
      html: "<h1>You successfully signed up!</h1>",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }
    const isValidPass = await bcryptjs.compare(password, user.password);
    console.log(isValidPass);

    if (!isValidPass) {
      req.flash("error", "Invalid password.");
      return res.redirect("/login");
    }
    req.session.isLoggedIn = true;
    req.session.user = user;
    await req.session.save();
    res.redirect("/");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

exports.postLogout = async (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset",
    errorMessage: req.flash("error"),
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "No account with that email");
      return res.redirect("/reset");
    }
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();
    console.log(req.body.email.trim());
    res.redirect("/");
    const mailOptions = {
      to: "yanielfuentes02@gmail.com",
      from: "ceyfuentes@gmail.com",
      subject: "Signup succeeded",
      text: `
<p> You requested a paswword reset </p>
<p> Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password </p>
`,
    };

    try {
      return transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error al enviar correo:", error);
      res.status(500).send("Error al enviar correo");
    }
  });
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
  if (!user) {
    flash("error", "Token is invalid or expired");
    return res.redirect("/login");
  }

  res.render("auth/new-password", {
    path: "/new-password",
    pageTitle: "New Password",
    errorMessage: req.flash("error"),
    userId: user._id.toString(),
    passwordToken: token,
  });
};

exports.postNewPassword = async (req, res, next) => {
  const { password, userId, passwordToken } = req.body;
  const user = await User.findOne({
    _id: userId,
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
  });

  if (user) {
    try {
      const encodedPass = await bcryptjs.hash(password, 12);
      user.password = encodedPass;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();
      res.redirect("/login");
    } catch (error) {
      const err = new Error(error);
      err.httpStatusCode = 500;
      return next(err);
    }
  }
};
