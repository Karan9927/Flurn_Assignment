const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seat.controller");

router.get("/getseats", seatController.getSeats);

router.get("/seat/:id", seatController.getSeatById);

module.exports = router;
