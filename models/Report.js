const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    portfolio_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PortfolioItem',
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    title: String,
    report_type: String,
    status: String,

    report_data: String,
    report_path: String,

    report_date: Date,

    current_price: Number,
    target_price: Number,

    approved_current_price: Number,
    approved_target_price: Number,
    approved_at: Date
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    collection: 'reports' // Explicitly set collection name
  }
);

module.exports = mongoose.model('Report', reportSchema);
