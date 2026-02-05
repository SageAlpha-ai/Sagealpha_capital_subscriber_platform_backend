// models/subscriber.model.js
const mongoose = require("mongoose");
const sagealphacapitalDB = require("../config/sagealphacapital.db");

const subscriberSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  referralCode: {
    type: String
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  paymentDate: {
    type: Date,
    required: true
  },
  paymentVerified: {
    type: Boolean,
    default: false
  },
  accessGiven: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = sagealphacapitalDB.model("Subscriber", subscriberSchema);
