const { Seat } = require("../models/seat.model");
const { SeatPrice } = require("../models/seatPrice.model");

async function getSeats(req, res) {
  try {
    const seats = await Seat.find().sort({ seat_class: 1 });
    res.json(seats);
  } catch (error) {
    console.error("Error retrieving seats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getSeatById(req, res) {
  const seatId = parseInt(req.params.id);
  try {
    // Find the seat by its ID
    const seat = await Seat.findOne({ id: seatId });
    if (!seat) {
      return res.status(404).json({ message: "Seat not found" });
    }

    // Retrieve the seat class
    const seatClass = seat.seat_class;

    const seatPrice = await SeatPrice.findOne({ seat_class: seatClass });
    if (!seatPrice) {
      return res.status(404).json({ message: "Seat price not found" });
    }

    const totalSeats = await Seat.countDocuments({ seat_class: seatClass });
    const bookedSeats = await Seat.countDocuments({
      seat_class: seatClass,
      is_booked: true,
    });

    const bookedPercentage = (bookedSeats / totalSeats) * 100;

    // Calculate the Price
    let price;
    if (bookedPercentage < 40) {
      price = seatPrice.min_price || seatPrice.normal_price;
    } else if (bookedPercentage >= 40 && bookedPercentage <= 60) {
      price = seatPrice.normal_price || seatPrice.max_price;
    } else {
      price = seatPrice.max_price || seatPrice.normal_price;
    }

    // Return seat details along with pricing
    res.json({ seat, price });
  } catch (error) {
    console.error("Error retrieving seat details and pricing:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getSeats: getSeats,
  getSeatById: getSeatById,
};
