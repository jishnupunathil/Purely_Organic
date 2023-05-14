const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    bname: { type: String, unique: true },
    bimages: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const bannerModel = mongoose.model("banner", bannerSchema);

module.exports = bannerModel;
