const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// GET all
router.get("/", async (req, res) => {
  const data = await Transaction.find().sort({ createdAt: -1 });
  res.json(data);
});

// POST new
router.post("/", async (req, res) => {
  const txn = new Transaction(req.body);
  await txn.save();
  res.status(201).json(txn);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

module.exports = router;
