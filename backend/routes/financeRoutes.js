const express = require("express");
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  setBudget,
} = require("../controllers/financeController");

router.get("/:profileId", getTransactions);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);
router.get("/:profileId/summary", getMonthlySummary);
router.post("/:profileId/budget", setBudget);

module.exports = router;
