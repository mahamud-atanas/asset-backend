// Models/request.js
const mongoose = require("mongoose");
const Joi = require("joi");

const requestSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    date:      { type: Date,   default: Date.now },
    department:{ type: String, required: true },

    departmentManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assetType: { type: String, required: true },
    quantity:  { type: Number, required: true, min: 1 },
    description:{ type: String, trim: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },

    // 🔴 REQUIRED so /my-requests works
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true } // gives createdAt for your sort
);

const Request = mongoose.model("Request", requestSchema);

// Server sets user from token; do NOT accept it from client
function validateRequest(payload) {
  return Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    date: Joi.date().optional(),
    department: Joi.string().required(),
    departmentManager: Joi.string().hex().length(24).required(),
    assetType: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    description: Joi.string().allow("").optional(),
    status: Joi.string().valid("Pending", "Approved", "Rejected").optional(),
    // user: (omitted on purpose)
  }).validate(payload);
}

exports.Request = Request;
exports.validate = validateRequest;
