const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
        required: true,
      },
    },
  ],
});

const wishModel = mongoose.model("wishList", wishlistSchema);

module.exports = wishModel;
