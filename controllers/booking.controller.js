const { Booking } = require("../models/booking.model");
const { SeatPrice } = require("../models/seatPrice.model");
const { Seat } = require("../models/seat.model");
const randomatic = require("randomatic");
const { Resend } = require("resend");

async function createBooking(req, res) {
  try {
    const { seatIds, name, email, phoneNumber } = req.body;

    const seatObjectIds = seatIds.map((seatId) => Number(seatId));

    // Check if all seatIds are valid
    const seats = await Seat.find({ id: { $in: seatObjectIds } });
    if (seats.length !== seatIds.length) {
      return res.status(400).json({ message: "One or more seats are invalid" });
    }

    // Check if any of the seats are already booked
    const alreadyBookedSeats = await Booking.find({
      seats: { $in: seatObjectIds },
    });
    if (alreadyBookedSeats.length > 0) {
      return res
        .status(400)
        .json({ message: "One or more seats are already booked" });
    }
    const seatClasses = [];
    seats.forEach((seat) => seatClasses.push(seat.seat_class));

    // Calculating Price
    let totalPrice = 0;
    for (const seatClass of seatClasses) {
      const seatPrice = await SeatPrice.findOne({ seat_class: seatClass });
      const totalSeats = await Seat.countDocuments({ seat_class: seatClass });
      const bookedSeats = await Seat.countDocuments({
        seat_class: seatClass,
        is_booked: true,
      });

      const bookedPercentage = (bookedSeats / totalSeats) * 100;
      let price;

      const minPrice =
        seatPrice && seatPrice.min_price
          ? parseFloat(seatPrice.min_price.replace("$", ""))
          : 0;
      const normalPrice =
        seatPrice && seatPrice.normal_price
          ? parseFloat(seatPrice.normal_price.replace("$", ""))
          : 0;
      const maxPrice =
        seatPrice && seatPrice.max_price
          ? parseFloat(seatPrice.max_price.replace("$", ""))
          : 0;

      if (bookedPercentage < 40) {
        price = minPrice || normalPrice;
      } else if (bookedPercentage >= 40 && bookedPercentage <= 60) {
        price = normalPrice || maxPrice;
      } else {
        price = maxPrice || normalPrice;
      }
      if (seatPrice) {
        totalPrice += price;
      } else {
        console.log(`No seat price found for seat class: ${seatClass}`);
      }
    }

    const bookingId = randomatic("0", 6);

    // Create the booking
    const booking = new Booking({
      seats: seatObjectIds,
      bookingId,
      name,
      email,
      phoneNumber,
      totalPrice,
    });
    await booking.save();

    // Update the booked status
    await Seat.updateMany(
      { id: { $in: seatObjectIds } },
      { $set: { is_booked: true } }
    );

    const message = `Hi ${name}, your booking has been successfully created. Booking ID: ${bookingId}, Total Price: $${totalPrice.toFixed(
      2
    )}`;

    // Email
    const resend = new Resend(process.env.RESEND_KEY);

    const { data, error } = await resend.emails.send({
      from: "contact@nitinp.dev",
      to: email,
      subject: "Booking COnfirmation",
      html: `<p>${message}</p>`,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(201).json({
      bookingId: bookingId,
      totalPrice: totalPrice.toFixed(0),
      message: "Booking created successfully. SMS notification sent.",
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getBooking(req, res) {
  try {
    const { name, phoneNumber } = req.query;

    const query = {};
    if (name) query.name = name;
    if (phoneNumber) query.phoneNumber = phoneNumber;

    if (name || phoneNumber) {
      const bookings = await Booking.find(query);
      if (bookings.length === 0) {
        return res.status(404).json({ message: "No bookings found." });
      }
      return res.status(200).json({ bookings });
    } else {
      return res
        .status(400)
        .json({ message: "Please provide name or phoneNumber." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error." });
  }
}

module.exports = {
  createBooking: createBooking,
  getBooking: getBooking,
};
