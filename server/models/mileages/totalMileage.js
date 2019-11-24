const mongoose = require('mongoose');

const MajorMileage = require('../mileages/majorMileage');

const TotalMileage = mongoose.Schema({
    user_num:           { type: Number, required: true, unique: true },
    user_name:          { type: String, required: true },
    year_of_study:      { type: Number, required: true },
    mileage_score:      [{
        code:               { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.MajorMileage', required: true },
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

  TotalMileage.methods.delScore = function(major_code, score) {
    for(let item of this.mileage_score) {
        if(item.code.description == major_code) {
            item.code.score -= score;
            this.save();
            return;
        }
    }
  }

  TotalMileage.methods.addScore = function(major_code, score) {
    let isExists = false;

    for(let item of this.mileage_score) {
        if(item.code.description == major_code) {
            isExists = true;

            item.code.score += score;
            this.save();
            return;
        }
    }

    if(!isExists) {
        return MajorMileage.findOneByCode(major_code).then(code => {
            this.mileage_score.push(
                {
                    code,
                    score
                }
            )
            this.save();
        })
    }
  }

  TotalMileage.methods.findOneByUserNum = function(user_num) {
      this.find({user_nunm: user_num}).populate({})
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