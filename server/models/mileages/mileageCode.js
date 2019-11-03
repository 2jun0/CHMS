const mongoose = require('mongoose');

const MileageCode = mongoose.Schema({
    code:          { type: String, required: true, unique: true },
    minor:         { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.MinorMileage', required: true },
    score:         { type: Number, required: true },
    detail:        { type: String, required: true },
    accept_method: { type: String, required: true },
    remark:        { type: String, default: null }
}, {
    collection: 'Codetype.Mileage'
  });

  MileageCode.statics.findOneByCode = function(code) {
    return this.findOne({ code: code }).populate({path:"minor", populate:{path:'major'}});
  }

  MileageCode.statics.findByCode = function(code) {
    return this.find({ code: code }).populate({path:"minor", populate:{path:'major'}});
  }

  MileageCode.statics.findAllCodes = function() {
    return this.find({}).populate({path:"minor", populate:{path:'major'}});
  }

  MileageCode.statics.findByMinorCode = function(minor) {
    return this.find({minor: minor}).populate({path:"minor", populate:{path:'major'}});
  }

  MileageCode.methods.toCustomObject = function() {
    let customObj = {
      id: this._id,
      code: this.code,
      minor: this.minor.code,
      score: this.score,
      detail: this.detail,
      accept_method: this.accept_method,
      remark: this.remark,
    };

    return customObj;
  }

module.exports = mongoose.model('Codetype.Mileage', MileageCode);