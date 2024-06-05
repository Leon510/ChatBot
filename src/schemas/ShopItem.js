const { Schema, model } = require("mongoose");

const ShopItemSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  additional: {
    type: String,
  },
});

module.exports = model("ShopItem", ShopItemSchema);
