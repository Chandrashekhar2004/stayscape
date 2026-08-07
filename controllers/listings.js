const Listing = require('../models/listing.js');
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/expressError.js");

// index functions for listings
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

// for new listing
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};
// for showing a specific listing
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
}
// for creating a new listing
module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let result = listingSchema.validate(req.body);
    console.log(result);
    if (result.error) {
        throw new ExpressError(result.error.message, 400);
    }
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Set the owner of the listing to the currently logged-in user
    newListing.image = { url, filename }; // Set the image URL and filename
    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
}
// for editing a listing
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}
// for updating a listing
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing);
    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
}
// for deleting a listing
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing!");

    res.redirect("/listings");
}