const { Schema, model } = require("mongoose");

const itemSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 }
});

const userProfileSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    lastDailyCollected: {
      type: Date,
    },
    commands: {
      type: Number,
      default: 0,
    },
    letzerCommand: {
      type: Date,
    },
    dailyRewardCollected: {
      type: Number,
      default: 0,
    },
    gewonnen: {
      type: Number,
      default: 0,
    },
    verloren: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 0,
    },
    xp: {
      type: Number,
      default: 0,
    },
    items: {
      type: [itemSchema], // Array of subdocuments
      default: [],
    },
    digCommandsPerDay: {
      type: Number,
      default: 0,
    },
    lastDigCommandDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = model("UserProfile", userProfileSchema);