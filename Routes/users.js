const  {User , validate} = require('../Models/user');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await User.find().sort({ dateOfRegister: -1 }); // Changed from Asset.find() to User.find()
        res.send(users);
    } catch (error) {
        res.status(500).send("Error retrieving users");
    }
});

router.post('/' , async(req , res) => {
    console.log('Data received' , req.body);
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    let user = await User.findOne({ email : req.body.email });
    if(user) return res.status(400).send('User already registered');

    user = new User(_.pick(req.body , ['firstname' , 'lastname' , 'email' , 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password , salt);

    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token' , token).send(_.pick(user,['_id' , 'firstname' , 'lastname' , 'email']));

})


module.exports = router;