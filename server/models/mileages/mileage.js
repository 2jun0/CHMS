const mongoose = require('mongoose');

const MileageCode = require('./mileageCode');

const { filterNullInObject } = require('../../utils/utils');

const Mileage = mongoose.Schema({
    user_num:       { type: Number, required: true, unique: true },
    user_name:      { type: String, required: true },
    department:     { type: String, required: true },
    input_date:     { type: Date, required: true, default: Date.now }, 
    code:           { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Mileage', required: true },
    score:          { type: Number },
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
                data.score = 0;

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
            code: this.code.code,
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

    // find mileages & count by user num
    Mileage.statics.findByUserNum = function(user_num, dataIndex) {
        return this.find({user_num}).sort({ "input_date" : -1 }).skip(dataIndex.start).limit(dataIndex.count)
            .populate({path:'code', populate:{path:"minor", populate:{path:'major'}}});
    };

    Mileage.statics.findCountByUserNum = function(user_num) {
        return this.count({user_num});
    };

    // find mileages & count with filter
    Mileage.statics.findWithFilter = function(filter, dataIndex) {
        return this.find(filter).sort({ "input_date" : -1 }).skip(dataIndex.start).limit(dataIndex.count)
            .populate({path:'code', populate:{path:"minor", populate:{path:'major'}}});
    };

    Mileage.statics.findCountWithFilter = function(filter) {
        return this.count(filter);
    };


module.exports = mongoose.model('Mileage', Mileage);