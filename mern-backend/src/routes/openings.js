const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Opening = require('../models/Opening');

router.get('/', async (req, res) => {
  try {
    // Cursor-friendly pagination via limit/skip. The hard 200 cap alone was
    // fine while the collection was small, but it doesn't scale as more
    // openings get added and it always paid the cost of fetching the max
    // page even for a client that only renders 20 rows.
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
    const items = await Opening.find().skip(skip).limit(limit).lean();
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
