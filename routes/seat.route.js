const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seat.controller");

router.get("/seats", seatController.getSeats);

router.get("/seats/:id", seatController.getSeatById);

module.exports = router;
