const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const {reviewSchema } = require('../schema.js');
const ExpressError = require('../utils/expressError.js');
const Listing = require('../models/listing.js');
const Reviews = require('../models/review.js');

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map(el => el.message).join(','); // to get all the error messages in a single string
    throw new ExpressError(errMsg, 400);
  } else {
    next();
  }
};
// add review route
router.post("/", validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Reviews(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  res.redirect(`/listings/${listing._id}`);
}));

// delete review route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Reviews.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
}));

module.exports = router;