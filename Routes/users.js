// routes/users.js
const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

const { User, validate } = require('../Models/user');

// Optional: restrict to known roles (edit if you have more)
const ALLOWED_ROLES = new Set(['user', 'admin', 'superadmin']);

/**
 * GET /api/users
 * Return users, newest first
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ dateOfRegister: -1 });
    res.send(users);
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving users' });
  }
});

/**
 * POST /api/users
 * Register user
 */
router.post('/', async (req, res) => {
  try {
    console.log('Data received', req.body);

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered');

    user = new User(_.pick(req.body, ['firstname', 'lastname', 'email', 'password']));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    // If you have user.generateAuthToken() defined on the model:
    const token = user.generateAuthToken?.();
    const payload = _.pick(user, ['_id', 'firstname', 'lastname', 'email']);

    if (token) {
      res.header('x-auth-token', token).send(payload);
    } else {
      res.send(payload);
    }
  } catch (e) {
    res.status(500).send({ message: e.message || 'Server error' });
  }
});

/**
 * PATCH /api/users/:id/role
 * Body: { role: "admin" }
 */
router.patch('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const role = String(req.body.role || '').toLowerCase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'Invalid user id' });
    }
    if (!role) {
      return res.status(400).send({ message: 'Missing role' });
    }
    if (ALLOWED_ROLES.size && !ALLOWED_ROLES.has(role)) {
      return res.status(400).send({ message: `Invalid role: ${role}` });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true, runValidators: true }
    ).lean();

    if (!user) return res.status(404).send({ message: 'User not found' });
    return res.status(200).send({ message: 'Role updated', user });
  } catch (e) {
    return res.status(500).send({ message: e.message || 'Server error' });
  }
});

/**
 * PATCH /api/users/updateRole
 * Body: { userId / id / _id, role }
 * This matches your frontend default: http://localhost:5000/api/users/updateRole
 */
router.patch('/updateRole', async (req, res) => {
  try {
    const id = req.body.userId || req.body.id || req.body._id;
    const role = String(req.body.role || '').toLowerCase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'Invalid user id' });
    }
    if (!role) {
      return res.status(400).send({ message: 'Missing role' });
    }
    if (ALLOWED_ROLES.size && !ALLOWED_ROLES.has(role)) {
      return res.status(400).send({ message: `Invalid role: ${role}` });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true, runValidators: true }
    ).lean();

    if (!user) return res.status(404).send({ message: 'User not found' });
    return res.status(200).send({ message: 'Role updated', user });
  } catch (e) {
    return res.status(500).send({ message: e.message || 'Server error' });
  }
});

module.exports = router;
