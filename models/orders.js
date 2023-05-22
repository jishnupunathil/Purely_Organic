const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  productName: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  productImage: {
    type: String,
    required: true,
  },
});

const OrderItem = mongoose.model("OrderItem", OrderItemSchema);

const OrderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  order_date: {
    type: Date,
    default: Date.now,
  },
  subTotal: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  total_amount: {
    type: Number,
    required: true,
  },
  payment_status: {
    type: String,
    enum: ["paid", "pending", "cancelled"],
    default: "pending",
  },
  payment_method: {
    type: String,
    enum: ["cash_on_delivery", "online_payment", "wallet"],
    required: true,
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "address",
    required: true,
  },
  order_status: {
    type: String,
    required: true,
  },
  refund: String,
  return_status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  return_reason: String,
  items: [OrderItemSchema],
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = { Order, OrderItem };
