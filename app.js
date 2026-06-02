const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/expressError.js');
const app = express();
const listings = require('./routes/listing.js');
const review = require('./routes/review.js');
// Set the view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, '/public')));

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

app.get('/', (req, res) => {
  res.send('Hi, I am Root');
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", review);

app.all("/{*splat}", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.render("error.ejs", { message });
  // res.status(statusCode).send(message);
});