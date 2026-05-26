const express = require('express');
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const app = express();
// Set the view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, '/public')));

const port = 8080;

const MONGO_URL = "mongodb://localhost:27017/wanderlust";

main().then(() => {
  console.log('Connected to MongoDB successfully');
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

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     image: "",
//     price: 100,
//     location: "calangute , goa",
//     country: "india"
//   });

//   await sampleListing.save();
//   res.send('Sample listing created successfully');
// });
// Index route 
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});
// New route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
// Show route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});
// Create route
app.post("/listings", async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
});
// edit route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

// update route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, req.body.listing);
  res.redirect(`/listings/${id}`);
});
// delete route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});