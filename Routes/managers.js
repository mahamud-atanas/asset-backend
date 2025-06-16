const express = require('express');
const { Manager } = require('../models/manager'); // Import Manager model
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('config');
const router = express.Router();

// GET all managers
router.get('/', async (req, res) => {
    try {
        const managers = await Manager.find().sort({ firstname: 1 });
        res.send(managers);
    } catch (error) {
        res.status(500).send("Error retrieving managers");
    }
});

// POST new manager (Register)
router.post('/', async (req, res) => {
    console.log('Data received:', req.body);

    // Validate request data
    const { firstname, lastname, email, password, department } = req.body;
    if (!firstname || !lastname || !email || !password || !department) {
        return res.status(400).send("All fields are required.");
    }

    // Check if manager already exists
    let manager = await Manager.findOne({ email: req.body.email });
    if (manager) return res.status(400).send('Manager already registered');

    // Create new manager
    manager = new Manager(_.pick(req.body, ['firstname', 'lastname', 'email', 'password', 'department']));

    // Hash password
    const salt = await bcrypt.genSalt(10);
    manager.password = await bcrypt.hash(manager.password, salt);

    await manager.save();

    // Generate auth token
    const token = manager.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(manager, ['_id', 'firstname', 'lastname', 'email', 'department']));
});

module.exports = router;
