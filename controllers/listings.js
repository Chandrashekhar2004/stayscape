const axios = require("axios");
const Listing = require('../models/listing.js');
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/expressError.js");

// index functions for listings
module.exports.index = async (req, res) => {
    const { category } = req.query;

    let allListings;

    if (category) {
        allListings = await Listing.find({ category });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings });
};
// for new listing
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};
// for searching listings
module.exports.searchListings = async (req, res) => {
    const { q } = req.query;

    const allListings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } }
        ]
    });

    if (allListings.length === 0) {
        req.flash("error", `No listings found for "${q}"`);
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings });
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

    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    // OpenStreetMap API
    const address = `${newListing.location}, ${newListing.country}`;

    const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: address,
                format: "json",
                limit: 1
            },
            headers: {
                "User-Agent": "StayScape"
            }
        }
    );

    if (response.data.length > 0) {
        newListing.geometry = {
            type: "Point",
            coordinates: [
                parseFloat(response.data[0].lon),
                parseFloat(response.data[0].lat)
            ]
        };
    }

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
    let originalImageUrl = listing.image.url; // Store the original image URL
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
}
// for updating a listing
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, req.body.listing);
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
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