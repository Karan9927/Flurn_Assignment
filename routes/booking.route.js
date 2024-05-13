const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");

router.post("/createBooking", bookingController.createBooking);

router.get("/getbooking", bookingController.getBooking);

module.exports = router;
