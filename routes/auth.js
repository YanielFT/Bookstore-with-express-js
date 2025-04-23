const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { check, body } = require("express-validator");
const User = require("../models/user");
router.get("/login", authController.getLogin);
router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please, enter a valid email")
      .normalizeEmail(),
    body(
      "password",
      "Please, enter a password with only numbers and text and at least 5 characters"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);
router.get("/signup", authController.getSignup);
router.get("/reset", authController.getReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/reset", authController.postReset);
router.post("/new-password", authController.postNewPassword);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please, enter a valid email")
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject(
            "This email exists already, please pick a different one"
          );
        }
        return Promise.resolve();
      }),
    body(
      "password",
      "Please, enter a password with only numbers and text and at least 5 characters"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password have to match");
      } else return true;
    }),
  ],
  authController.postSignup
);
router.post("/logout", authController.postLogout);

module.exports = router;
