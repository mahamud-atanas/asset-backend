const Joi = require('joi');
const config = require('config');
const auth = require('./Routes/auth');
const users = require('./Routes/users');
const asset = require('./Routes/asset');
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const app = express();

// Check for jwtPrivateKey configuration
if(!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR : jwtPrivateKey is not defined');
    process.exit(1);
}

// MongoDB connection
mongoose.connect('mongodb+srv://mahamudatanas:<db_password>@cluster0.bgdsgx4.mongodb.net/')
    .then(() => console.log('Database connected successfully...'))
    .catch(err => console.log('Database not connected...', err));

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());


// Routes
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/asset', asset);


// Listen on the specified port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
