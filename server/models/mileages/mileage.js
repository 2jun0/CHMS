const mongoose = require('mongoose');

const MileageCode = require('./mileageCode');

const { filterNullInObject, cloneObject } = require('../../utils/utils');
const { deleteFile } = require('../../utils/files');

const Mileage = mongoose.Schema({
    user_num:       { type: Number, required: true },
    user_name:      { type: String, required: true },
    department:     { type: String, required: true },
    year_of_study:  { type: Number, required: true },
    input_date:     { type: Date, required: true, default: Date.now }, 
    code:           { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Mileage', required: true },
    score:          { type: Number },
    act_date: {
        from:       { type: Date, required: true},
        to:         { type: Date, required: true},
    },
    detail:         { type: String, required: true},
    info_photos:    [{ type: mongoose.SchemaTypes.ObjectId, ref: 'File'}],
    is_accepted:    { type: Boolean, default: true},
    accept_date:    { type: Date, default: Date.now}
}, {
    collection: 'Mileage'
  });

    Mileage.statics.create = function(data) {
        return MileageCode.findOneByCode(data.code)
            .then(code => {

                data.code = code;
                data.score = code.score;
                data.is_accepted = true;

                let mileage = new this(data);
                return mileage;

                // 같은 날에 같은 코드를 올리면 안됨.
                // let date = new Date();
                // let today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                // let tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1);
                // return this.find({
                //     user_num: data.user_num,
                //     input_date: {$gte: today, $lte: tomorrow},
                //     code: code
                // })
                // .then(doc => {
                //     // 같은 날에 같은 코드가 있음.
                //     // if(doc && doc.length>0) {
                //     //     throw new Error('해당 마일리지는 오늘 이미 생성하셨습니다!');
                //     // }

                //     // 같은 날에 같은 코드 안올림 => 추가
                //     data.code = code;
                //     data.score = 0;

                //     let mileage = new this(data);
                //     return mileage;
                // })
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

    // customObject -> originObject
    Mileage.statics.customObjectToOriginObject = function(customObj) {
        let doc = cloneObject(customObj);
        doc._id = doc.id;

        let promiseArray = [];

        if(customObj.code) { 
            promiseArray.push(MileageCode.findOneByCode(customObj.code)
                .then(code => { doc.code = code; }));
        }

        if(doc.info_photos) {
            for(var i = 0; i < doc.info_photos.length; i++) {
                doc.info_photos[i]._id = customObj.info_photos[i].id;
            }
        }
        
        return Promise.all(promiseArray).then(() => {return doc;});
    }

    Mileage.statics.deleteById = async function(mileage_id) {
        var doc = await this.findOneById(mileage_id);
        for(var info_photo of doc.info_photos) {
            await deleteFile(info_photo, `mileage/${mileage_id}`);
        }
        return doc.deleteOne();
    }

    // find mileages & count by user num
    Mileage.statics.findByUserNum = function(user_num, dataIndex) {
        if(dataIndex) {
            return this.find({user_num}).sort({ "input_date" : -1 }).sort({"user_name": -1}).sort({"code.code": -1}).skip(dataIndex.start).limit(dataIndex.count)
            .populate({path:'code', populate:{path:"minor", populate:{path:'major'}}});
        }else{
            return this.find({user_num}).sort({ "input_date" : -1 }).sort({"user_name": -1}).sort({"code.code": -1})
            .populate({path:'code', populate:{path:"minor", populate:{path:'major'}}});
        }
    };

    Mileage.statics.findCountByUserNum = function(user_num) {
        return this.count({user_num});
    };

    // find mileages & count with filter
    Mileage.statics.findWithFilter = function(filter, dataIndex) {
        return this.find(filter).sort({ "input_date" : -1 }).sort({"user_name": -1}).sort({"code.code": -1}).skip(dataIndex.start).limit(dataIndex.count)
            .populate({path:'code', populate:{path:"minor", populate:{path:'major'}}});
    };

    Mileage.statics.findCountWithFilter = function(filter) {
        return this.count(filter);
    };

    // find sum of scores
    Mileage.statics.findSumOfScoreWithFilter = function(filter) {
        // select sum(score) from Mileage select filter 
        // return this.aggregate([
        //     { $match: filter },
        //     { $group: {
        //         _id: 'null',
        //         sum_of_score: {$sum: '$score'}
        //     } }
        // ]).then(result => {
        //     if(result && result.length > 0)
        //         return result[0].sum_of_score;
        //     else
        //         return 0;
        // });

        return this.find(filter)
            .then(doc_mileages => {
                let sum = 0;

                for(var doc of doc_mileages) {
                    sum += doc.score;
                }

                return sum;
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

    Mileage.statics.findOneById = function(id) {
        return this.findOne({_id: id}).populate({path:'code', populate:{path:"minor", populate:{path:'major'}}});
    };

    Mileage.methods.updateIsAccepted = function(is_accepted) {
        this.is_accepted = is_accepted;
        this.accept_date = new Date();
        // 만약 사업단이 확인하면 점수를 부여하고 아니면 0으로..
        if(is_accepted) {
            this.score = this.code.score;
        }else{
            this.score = 0;
        }

        this.save();
    }


module.exports = mongoose.model('Mileage', Mileage);