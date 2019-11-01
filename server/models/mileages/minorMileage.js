const mongoose = require('mongoose');

const MinorMileage = mongoose.Schema({
    code:       { type: String, required: true, unique: true },
    major:      { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.MajorMileage'},
    description:{ type: String, required: true }
}, {
    collection: 'Codetype.MinorMileage'
  });

    MinorMileage.statics.findOneByCode = function(code) {
        if(this.holder[code]) {
            return Promise.resolve(this.holder[code]);
        }else{
            return this.findOne({ code: code })
                .then(code => {
                    this.holder[code] = code;
                    return code;
                })
                .catch(err => { console.log(err); }); 
        }
    }

    MinorMileage.statics.findOneById = function(_id) {
        return this.findOne({ _id : _id })
            .catch(err => { console.log(err); });
    }

    MinorMileage.statics.findByMajorCode = function(major) {
        return this.find({major: major}).populate({path:"major"});
    }

    MinorMileage.statics.toCustomObject = function() {
        let customObj = {
            code: this.code,
            major: this.major.code,
            description: this.description,
        };

        return customObj;
    }

    MinorMileage.statics.holder = {};

module.exports = mongoose.model('Codetype.MinorMileage', MinorMileage);