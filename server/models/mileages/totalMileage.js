const mongoose = require('mongoose');

const MinorMileage = mongoose.Schema({
    user_num:           { type: Number, required: true, unique: true },
    user_name:          { type: String, required: true },
    year_of_study:      { type: Number, required: true },
    mileage_score:      [{
        code:               { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Mileage', required: true },
        score:              { type: Number, required: true }
    }],
    total_score:        { type: Number, required: true },
    last_update_date:   { type: Date, required: true }
}, {
    collection: 'TotalMileage'
  });

module.exports = mongoose.model('TotalMileage', MinorMileage);