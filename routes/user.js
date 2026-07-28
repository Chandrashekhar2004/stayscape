const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");
// signup routes
router.get("/signup", userController.renderSignupForm);

router.post("/signup", wrapAsync(userController.signup));

// login routes
router.get("/login", userController.renderLoginForm);

router.post("/login",savedRedirectUrl, passport.authenticate("local", {
  failureFlash: true,
  failureRedirect: "/login"
}),userController.login);
//logout 
router.get("/logout", userController.logout);

module.exports = router;
