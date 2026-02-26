const Pricing = require('../models/Pricing');

// @route   GET /api/pricing
// @desc    Get all pricing entries (public)
// @access  Public
exports.getAllPricing = async (req, res) => {
  try {
    const pricing = await Pricing.find().sort({ category: 1, days: 1 });

    // Transform into a matrix: { single: { 7: 35500, 15: 69000 }, ... }
    const matrix = {};
    pricing.forEach((p) => {
      if (!matrix[p.category]) {
        matrix[p.category] = {};
      }
      matrix[p.category][p.days] = p.price;
    });

    res.status(200).json({
      success: true,
      count: pricing.length,
      pricing,
      matrix,
    });
  } catch (error) {
    console.error('Error fetching pricing:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch pricing' });
  }
};

// @route   PUT /api/pricing
// @desc    Upsert a pricing entry (create or update)
// @access  Admin
exports.upsertPricing = async (req, res) => {
  try {
    const { category, days, price } = req.body;

    if (!category || !days || price === undefined) {
      return res.status(400).json({ success: false, message: 'Category, days, and price are required' });
    }

    const pricing = await Pricing.findOneAndUpdate(
      { category, days },
      { category, days, price },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Pricing updated successfully',
      pricing,
    });
  } catch (error) {
    console.error('Error upserting pricing:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update pricing' });
  }
};

// @route   PUT /api/pricing/bulk
// @desc    Bulk upsert all pricing entries
// @access  Admin
exports.bulkUpsertPricing = async (req, res) => {
  try {
    const { entries } = req.body;

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ success: false, message: 'Pricing entries array is required' });
    }

    const operations = entries.map((entry) => ({
      updateOne: {
        filter: { category: entry.category, days: entry.days },
        update: { category: entry.category, days: entry.days, price: entry.price },
        upsert: true,
      },
    }));

    await Pricing.bulkWrite(operations);

    // Fetch updated pricing
    const pricing = await Pricing.find().sort({ category: 1, days: 1 });

    res.status(200).json({
      success: true,
      message: 'All pricing updated successfully',
      pricing,
    });
  } catch (error) {
    console.error('Error bulk upserting pricing:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update pricing' });
  }
};

// @route   DELETE /api/pricing/:id
// @desc    Delete a pricing entry
// @access  Admin
exports.deletePricing = async (req, res) => {
  try {
    const pricing = await Pricing.findByIdAndDelete(req.params.id);

    if (!pricing) {
      return res.status(404).json({ success: false, message: 'Pricing entry not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Pricing entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting pricing:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete pricing' });
  }
};

// @route   POST /api/pricing/seed
// @desc    Seed default pricing if none exists
// @access  Admin
exports.seedPricing = async (req, res) => {
  try {
    const count = await Pricing.countDocuments();

    if (count > 0) {
      return res.status(200).json({ success: true, message: 'Pricing already seeded', seeded: false });
    }

    const defaults = [
      { category: 'single', days: 7, price: 35500 },
      { category: 'single', days: 15, price: 69000 },
      { category: 'double', days: 7, price: 45500 },
      { category: 'double', days: 15, price: 79500 },
      { category: 'dormitory', days: 7, price: 19250 },
      { category: 'dormitory', days: 15, price: 41250 },
    ];

    await Pricing.insertMany(defaults);

    res.status(201).json({
      success: true,
      message: 'Default pricing seeded successfully',
      seeded: true,
    });
  } catch (error) {
    console.error('Error seeding pricing:', error.message);
    res.status(500).json({ success: false, message: 'Failed to seed pricing' });
  }
};
