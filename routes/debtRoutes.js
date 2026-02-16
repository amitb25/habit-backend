const express = require("express");
const router = express.Router();
const {
  getDebts,
  createDebt,
  recordPayment,
  getPayments,
  deleteDebt,
} = require("../controllers/debtController");

router.get("/:profileId", getDebts);
router.post("/", createDebt);
router.post("/:id/pay", recordPayment);
router.get("/:id/payments", getPayments);
router.delete("/:id", deleteDebt);

module.exports = router;
