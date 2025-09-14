// routes/request.js
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const mongoose = require('mongoose');
const { Request, validate } = require('../Models/request');
const auth = require('../Middleware/auth');   // should set req.user = { _id, role, ... }
const admin = require('../Middleware/admin'); // blocks unless role is admin/superadmin

// --- helpers ---
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const isAdmin = (u) => ['admin', 'superadmin'].includes(String(u?.role || '').toLowerCase());

// ✅ Get Requests of Logged-in User (place BEFORE '/:id')
router.get('/my-requests', auth, async (req, res) => {
  try {
    const docs = await Request.find({ user: req.user._id })
      .populate('departmentManager', 'firstname lastname')
      .sort({ createdAt: -1, _id: -1 });
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching your requests' });
  }
});

// ✅ Get All Requests (Admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('departmentManager', 'firstname lastname')
      .sort({ createdAt: -1, _id: -1 });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving requests' });
  }
});

// ✅ Get Single Request by ID (Admin or owner)
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: 'Invalid request id' });

  try {
    const request = await Request.findById(id)
      .populate('departmentManager', 'firstname lastname');
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (!isAdmin(req.user) && String(request.user) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving request' });
  }
});

// ✅ Create a New Request (any authenticated user)
router.post('/', auth, async (req, res) => {
  console.log('Request Data received', req.body);
  const { error } = validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    let request = new Request({
      ..._.pick(req.body, [
        'firstName',
        'lastName',
        'date',
        'department',
        'departmentManager',
        'assetType',
        'quantity',
        'description',
      ]),
      user: req.user._id,         // link to creator
      status: 'Pending',
    });

    request = await request.save();
    res.status(201).json({ message: 'Request submitted successfully', request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error saving request' });
  }
});

// ✅ Update Status (Admin only)
router.put('/:id/status', [auth, admin], async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!isValidId(id)) return res.status(400).json({ error: 'Invalid request id' });
  if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!updatedRequest) return res.status(404).json({ error: 'Request not found' });
    res.json({ message: `Request ${status.toLowerCase()} successfully`, request: updatedRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating request status' });
  }
});

// ✅ Delete a Request (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: 'Invalid request id' });

  try {
    const request = await Request.findByIdAndDelete(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json({ message: 'Request deleted successfully', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting request' });
  }
});

module.exports = router;
