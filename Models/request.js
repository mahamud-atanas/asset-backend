const mongoose = require("mongoose");
const Joi = require("joi");

// Mongoose Schema for Request Form
const requestSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true, // Input: requester first name
        trim: true
    },
    lastName: {
        type: String,
        required: true, // Input: requester last name
        trim: true
    },
    date: {
        type: Date,
        default: Date.now, // Input: request date
    },
    department: {
        type: String,
        required: true, // Input: department requesting the asset/stationery
    },
    departmentManager: {
        type: mongoose.Schema.Types.ObjectId, // References User model
        ref: "User",
        required: true
    },
    assetType: {
        type: String,
        required: true, // Input: type of asset/stationery requested
    },
    quantity: {
        type: Number,
        required: true,
        min: 1 // Input: requested quantity
    },
    description: {
        type: String,
        required: false, // Optional details
        trim: true
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending" // Tracks approval workflow
    }
});

const Request = mongoose.model("Request", requestSchema);

// Joi validation
function validateRequest(request) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        date: Joi.date().default(Date.now),
        department: Joi.string().required(),
        departmentManager: Joi.string().required(), // Must be a valid User ID
        assetType: Joi.string().required(),
        quantity: Joi.number().required().min(1),
        description: Joi.string().allow(""),
        status: Joi.string().valid("Pending", "Approved", "Rejected").default("Pending")
    });

    return schema.validate(request);
}

exports.Request = Request;
exports.validate = validateRequest;
