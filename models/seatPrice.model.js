const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const seatPriceSchema = new Schema({
  id: Number,
  seat_class: String,
  min_price: String,
  normal_price: String,
  max_price: String,
});

const SeatPrice = mongoose.model("seatprices", seatPriceSchema);

module.exports = { SeatPrice };
