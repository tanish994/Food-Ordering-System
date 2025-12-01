const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: String,
  foodItemId: String,
  quantity: Number,
  totalAmount: Number,
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order",orderSchema);