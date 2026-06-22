const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Opening = require('../models/Opening');

router.get('/', async (req, res) => {
  try {
    const items = await Opening.find().limit(200).lean();
    const mapped = items.map(item => ({ ...item, id: item.externalId }));
    return res.json(mapped);
  } catch (err) {
    console.error('Openings list error', err)
    return res.status(500).json({ error: 'internal_server_error' })
  }
});

router.get('/:id', async (req, res) => {
  try {
    const query = mongoose.isValidObjectId(req.params.id) 
      ? { _id: req.params.id }
      : { externalId: req.params.id };
    const item = await Opening.findOne(query).lean();
    if (!item) return res.status(404).json({ error: 'Not found' });
    return res.json({ ...item, id: item.externalId });
  } catch (err) {
    console.error('Openings get error', err)
    return res.status(500).json({ error: 'internal_server_error' })
  }
});

module.exports = router;
