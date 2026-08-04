const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

// signup routes
router.route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

// login routes
router.route("/login")
  .get(userController.renderLoginForm)
  .post(savedRedirectUrl, passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
  }), userController.login);

//logout 
router.get("/logout", userController.logout);

module.exports = router;
