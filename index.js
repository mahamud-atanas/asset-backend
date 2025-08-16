const Joi = require('joi');
const config = require('config');
const auth = require('./Routes/auth');
const users = require('./Routes/users');
const asset = require('./Routes/asset');
const request = require('./Routes/request');
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const app = express();

// Ensure jwtPrivateKey is defined
if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR : jwtPrivateKey is not defined');
    process.exit(1);
}

// Connect to MongoDB using URI from environment variable
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Database connected successfully...'))
.catch(err => console.error('❌ Database connection failed:', err));

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/asset', asset);
app.use('/api/request', request);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Listening on port ${port}`));
