const mongoose = require('mongoose');

const MileageCode = require('../mileages/mileageCode');

const TotalMileage = mongoose.Schema({
    user_num:           { type: Number, required: true, unique: true },
    user_name:          { type: String, required: true },
    year_of_study:      { type: Number, required: true },
    mileage_score:      [{
        code:               { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Mileage', required: true },
        score:              { type: Number, required: true }
    }],
    total_score:        { type: Number, required: true, default: 0 },
    last_update_date:   { type: Date, required: true, default: Date.now }
}, {
    collection: 'TotalMileage'
  });

  TotalMileage.statics.create = function (data) {
    return Promise.resolve(this(data));
  }

  TotalMileage.statics.delScore = function(mileage_code, score) {
    
  }

  TotalMileage.statics.addScore = function(mileage_code, score) {

  }

  TotalMileage.methods.toCustomObject = function() {
      return {
          id: this._id,
          user_num: this.user_num,
          user_name: this.user_name,
          year_of_study: this.year_of_study,
          //......
      }
  }

module.exports = mongoose.model('TotalMileage', TotalMileage);