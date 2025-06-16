
const mongoose = require("mongoose");
const Joi = require("joi");

const assetSchema = new mongoose.Schema({
    tagNumber: {
        type: String,
        required: true // Input: asset tag number, e.g. "ASSET-004"
    },
    dateOfRegister: {
        type: Date,
        default: Date.now // Input: asset registration date, can be set by the user
    },
    itemDescription: {
        type: String,
        required: true // Input: description of the asset, e.g. "Laptop"
    },
    department: {
        type: String,
        required: true // Input: department the asset belongs to, e.g. "IT"
    },
    departmentManager: {
        type: mongoose.Schema.Types.ObjectId,  // References the "User" model
        ref: "User",
        required: true // Input: the department manager's ObjectId (reference to User)
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,  // References the "User" model
        ref: "User",
        required: true // Input: user assigned to the asset, reference to User model
    },
    physicalLocation: {
        type: String,
        required: true // Input: physical location of the asset, e.g. "Office 3C"
    },
    assetCondition: {
        type: String,
        required: true // Input: condition of the asset, e.g. "New"
    },
    quantity: {
        type: Number,
        required: true, 
        min: 1 // Input: quantity of the asset, e.g. 2
    },
    category: {
        type: String,
        required: true // Input: category of the asset, e.g. "Electronics"
    },
    costPerItem: {
        type: Number,
        required: true,
        min: 0 // Input: cost per individual item, e.g. 125000
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0 // Input: total amount for the asset, e.g. 250000
    },
    depreciationRate: {
        type: Number,
        required: true,
        min: 0 // Input: depreciation rate, e.g. 5 (percent)
    },
    usefulLifeMonths: {
        type: Number,
        required: true,
        min: 1 // Input: useful life in months, e.g. 60 months
    },
    numberOfMonthsInUse: {
        type: Number,
        required: true,
        min: 0 // Input: number of months the asset has been in use
    },
    numberOfRemainingMonths: {
        type: Number,
        required: true,
        min: 0 // Input: remaining months until end of useful life
    },
    monthlyDepreciation: {
        type: Number,
        required: true,
        min: 0 // Input: depreciation amount per month, e.g. 5000
    },
    accumulatedDepreciation: {
        type: Number,
        required: true,
        min: 0 // Input: accumulated depreciation so far, e.g. 60000
    },
    invoiceNumber: {
        type: Number,
        required: true,
    }
});

const Asset = mongoose.model("Asset", assetSchema);

// ✅ Joi Validation
function validateAsset(asset) {
    const schema = Joi.object({
        tagNumber: Joi.string().required(),
        dateOfRegister: Joi.date().default(Date.now),
        itemDescription: Joi.string().required(),
        department: Joi.string().required(),
        departmentManager: Joi.string(),  // Must be an existing User ID
        user: Joi.string().required(),  // Must be an existing User ID
        physicalLocation: Joi.string().required(),
        assetCondition: Joi.string().required(),
        quantity: Joi.number().required().min(1),
        category: Joi.string().optional(),  // Assuming category is a string; update if needed
        costPerItem: Joi.number().required().min(0),
        totalAmount: Joi.number().required().min(0),
        depreciationRate: Joi.number().required().min(0),
        usefulLifeMonths: Joi.number().required().min(1),
        numberOfMonthsInUse: Joi.number().required().min(0),
        numberOfRemainingMonths: Joi.number().required().min(0),
        monthlyDepreciation: Joi.number().required().min(0),
        accumulatedDepreciation: Joi.number().required().min(0),
        invoiceNumber: Joi.number().required()
    });    

    return schema.validate(asset);
}

exports.Asset = Asset;
exports.validate = validateAsset;
