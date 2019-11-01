const mongoose = require('mongoose');

const MileageCode = require('./mileageCode');

const Mileage = mongoose.Schema({
    user_num:       { type: Number, required: true, unique: true },
    user_name:      { type: String, required: true },
    department:     { type: String, required: true },
    input_date:     { type: Date, required: true, default: Date.now }, 
    code:           { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Mileage', required: true },
    score:          { type: Number, required: true },
    act_date: {
        from:       { type: Date, required: true},
        to:         { type: Date, required: true},
    },
    detail:         { type: String, required: true},
    info_photos:    [{ type: mongoose.SchemaTypes.ObjectId, ref: 'File'}],
    is_accepted:    { type: Boolean, default: false},
    accept_date:    { type: Date, default: null}
}, {
    collection: 'Mileage'
  });

    Mileage.statics.create = function(data) {
        return MileageCode.findOneByCode(data.code)
            .then(code => {
                data.code = code;

                let mileage = new this(data);
                return mileage;
            });
    }

    Mileage.methods.toCustomObject = function () {
        let result = filterNullInObject({
            user_num: this.user_num,
            user_name: this.user_name,
            department: this.department,
            input_date: this.input_date,
            code: this.code,
            score: this.score,
            act_date: {
                from: this.act_date.from,
                to: this.act_date.to
            },
            detail: this.detail,
            info_photos: this.info_photos,
            is_accepted: this.is_accepted,
            accept_date: this.accept_date,
        });

        return result;
    }


module.exports = mongoose.model('Mileage', Mileage);