const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  seats: [{ type: Number, ref: "Seat" }],
  bookingId: Number,
  name: String,
  email: String,
  phoneNumber: Number,
  totalPrice: Number,
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = { Booking };
