const mongoose = require('mongoose');

const MileageCode = mongoose.Schema({
    code:          { type: Number, required: true, unique: true },
    major_code:    { type: String, required: true },
    score:         { type: Number, required: true },
    detail:        { type: String, required: true },
    accept_method: { type: String, required: true },
    remark:        { type: String }
}, {
    collection: 'Codetype.Mileage'
  });

  MileageCode.statics.findOneByCode = function(code) {
    return this.findOne({ code: code });
  }

module.exports = mongoose.model('Codetype.Mileage', MileageCode);