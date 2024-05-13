const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const seatSchema = new Schema({
  _id: Number,
  seat_identifier: String,
  seat_class: String,
  is_booked: Boolean,
});

const Seat = mongoose.model("seats", seatSchema);

module.exports = { Seat };
