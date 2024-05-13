const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const seatsRouter = require("../routes/seat.route");
const bookingRouter = require("../routes/booking.route");

require("dotenv").config();

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use(bodyParser.json());

// Routes
app.use("/api", seatsRouter);
app.use("/api", bookingRouter);
app.use("*", (req, res) => {
  res.json({
    message: "Invalid API Request !",
  });
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
