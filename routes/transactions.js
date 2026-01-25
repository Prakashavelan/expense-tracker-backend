const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/authMiddleware"); 
// ✅ GET all transactions for logged-in user
router.get("/", auth, async (req, res) => {
  const data = await Transaction.find({
    userId: req.user.id
  }).sort({ createdAt: -1 });

  res.json(data);
});

// ✅ POST new transaction for logged-in user
router.post("/", auth, async (req, res) => {
  const txn = new Transaction({
    ...req.body,
    userId: req.user.id
  });

  await txn.save();
  res.status(201).json(txn);
});

// ✅ DELETE transaction (only owner)
router.delete("/:id", auth, async (req, res) => {
  const txn = await Transaction.findById(req.params.id);

  if (!txn) {
    return res.status(404).json({ msg: "Transaction not found" });
  }

  if (txn.userId.toString() !== req.user.id) {
    return res.status(403).json({ msg: "Not authorized" });
  }

  await txn.deleteOne();
  res.sendStatus(204);
});

module.exports = router;
