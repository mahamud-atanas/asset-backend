const jwt = require('jsonwebtoken');
const config = require('config');
const  {User} = require('../Models/user');
const _ = require('lodash');
const Joi = require('joi');
const bcrypt = require('bcrypts');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.post('/' , async(req , res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email : req.body.email});
    if(!user) return res.status(400).send("Invalid Email or Password");
    const validPassword = await bcrypt.compare(req.body.password , user.password);
    if(!validPassword) return res.status(400).send("Invalid Email or Password");

    const token = user.generateAuthToken();
    // res.send(token);
    res.json({ token });
});

function validate(req) {
    const schema = Joi.object({
        email : Joi.string().min(10).required().email(),
        password : Joi.string().min(5).max(1024).required()
    })

    return schema.validate(req);
}

module.exports = router;