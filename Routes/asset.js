const { Asset, validate } = require('../Models/asset');
const auth = require('../Middleware/auth');
const admin = require('../Middleware/admin');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

// ✅ Get All Assets
router.get("/", async (req, res) => {
    try {
      const assets = await Asset.find()
        .populate("user", "firstname lastname") // 🔥 Populate user details
        .populate("departmentManager", "firstname lastname"); // 🔥 Populate manager details
  
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving assets" });
    }
  });
  


// ✅ Get Asset by ID
router.get('/:id', async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) return res.status(404).send("Asset not found");
        res.send(asset);
    } catch (error) {
        res.status(500).send("Error retrieving asset");
    }
});

// ✅ Create a New Asset
router.post('/', [auth, admin], async (req, res) => {
    console.log("Asset Data received", req.body);
    
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        let asset = new Asset(_.pick(req.body, [
            'tagNumber',
            'dateOfRegister',
            'itemDescription',
            'department',
            'physicalLocation',
            'assetCondition',
            'quantity',
            'category',
            'costPerItem',
            'totalAmount',
            'depreciationRate',
            'usefulLifeMonths',
            'numberOfMonthsInUse',
            'numberOfRemainingMonths',
            'monthlyDepreciation',
            'accumulatedDepreciation',
            'departmentManager',
            'user',
            'invoiceNumber'
        ]));

        asset = await asset.save();
        res.status(201).json({ message: "Asset added successfully", asset });
    } catch (error) {
        res.status(500).send("Error saving asset");
    }
});

// ✅ Update an Existing Asset
router.put('/:id', [auth, admin], async (req, res) => {
    console.log("Incoming Update Request:", req.body); // ✅ Log request payload

    const { error } = validate(req.body);
    if (error) {
        console.error("Validation Error:", error.details); // ✅ Log validation errors
        return res.status(400).send(error.details[0].message);
    }

    try {
        const asset = await Asset.findByIdAndUpdate(
            req.params.id,
            _.pick(req.body, [
                'tagNumber',
                'dateOfRegister',
                'itemDescription',
                'department',
                'physicalLocation',
                'assetCondition',
                'quantity',
                'category',
                'costPerItem',
                'totalAmount',
                'depreciationRate',
                'usefulLifeMonths',
                'numberOfMonthsInUse',
                'numberOfRemainingMonths',
                'monthlyDepreciation',
                'accumulatedDepreciation',
                'departmentManager',
                'user',
                'invoiceNumber'
            ]),
            { new: true }
        );

        if (!asset) return res.status(404).send("Asset not found");

        res.json({ message: "Asset updated successfully", asset });
    } catch (error) {
        console.error("Update Error:", error.message); // ✅ Log any unexpected errors
        res.status(500).send("Error updating asset");
    }
});

// ✅ Delete an Asset
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const asset = await Asset.findByIdAndDelete(req.params.id);
        if (!asset) return res.status(404).send("Asset not found");

        res.json({ message: "Asset deleted successfully", asset });
    } catch (error) {
        res.status(500).send("Error deleting asset");
    }
});

module.exports = router;
