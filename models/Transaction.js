const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  date: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);
