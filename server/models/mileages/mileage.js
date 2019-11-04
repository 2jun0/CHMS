const mongoose = require('mongoose');

const MileageCode = require('./mileageCode');

const { filterNullInObject } = require('../../utils/utils');

const Mileage = mongoose.Schema({
    user_num:       { type: Number, required: true },
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
                // 같은 날에 같은 코드를 올리면 안됨.
                let date = new Date();
                let today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                let tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1);

                return this.find({
                    user_num: data.user_num,
                    input_date: {$gte: today, $lte: tomorrow},
                    code: code
                })
                .then(doc => {
                    // 같은 날에 같은 코드가 있음.
                    if(doc && doc.length>0) {
                        throw new Error('해당 마일리지는 오늘 이미 생성하셨습니다!');
                    }

                    // 같은 날에 같은 코드 안올림 => 추가
                    data.code = code;
                    data.score = 0;

                    let mileage = new this(data);
                    return mileage;
                })
            })
    }

    Mileage.methods.toCustomObject = function () {
        let result = filterNullInObject({
            id: this._id,
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

    // find sum of scores
    Mileage.statics.findSumOfScoreWithFilter = function(filter) {
        // select sum(score) from Mileage select filter 
        return this.aggregate([
            { $match: filter },
            { $group: {
                _id: 'null',
                sum_of_score: {$sum: '$score'}
            } }
        ]).then(result => {
            return result[0].sum_of_score;
        });
    };

    // find sum of score of codes
    Mileage.statics.findSumOfPredictedScoreWithFilter = function(filter) {
        return this.find(filter).populate({path:'code', populate:{path:"minor", populate:{path:'major'}}})
            .then(doc_mileages => {
                let sum = 0;

                for(var doc of doc_mileages) {
                    sum += doc.code.score;
                }

                return sum;
            });
    };


module.exports = mongoose.model('Mileage', Mileage);