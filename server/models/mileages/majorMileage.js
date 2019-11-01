const mongoose = require('mongoose');

const MajorMileage = mongoose.Schema({
    code:       { type: String, required: true, unique: true },
    description:{ type: String, required: true }
}, {
    collection: 'Codetype.MajorMileage'
  });

    MajorMileage.statics.findOneByCode = function(code) {
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

    MajorMileage.statics.findOneById = function(_id) {
        return this.findOne({ _id : _id })
            .catch(err => { console.log(err); });
    }

    MajorMileage.statics.holder = {};

module.exports = mongoose.model('Codetype.MajorMileage', MajorMileage);