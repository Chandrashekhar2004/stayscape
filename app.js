
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/expressError.js');
const app = express();

const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

// Set the view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, '/public')));

const sessionOptions = {
  secret: 'mysecretcode', // should be a long and secure string in production
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true, // to prevent client-side JavaScript from accessing the cookie
  }
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const port = 8080;

const MONGO_URL = "mongodb://localhost:27017/StayScape";

main().then(() => {
  console.log('Connected to MongoDB successfully',);
})
  .catch(err => {
    console.log('Error connecting to MongoDB:', err);
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// app.get('/', (req, res) => {
//   res.send('Hi, I am Root');
// });

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user; // Make the current user available in all templates
  next();
});

// app.get("/demouser", async (req, res) => {
//   const fakeUser = new User({
//     username: "demo",
//     email: "demo@example.com"
//   });
//   await User.register(fakeUser, "password123");
//   res.send("Demo user created!");
// });
 
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("/{*splat}", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.render("error.ejs", { message });
  // res.status(statusCode).send(message);
});