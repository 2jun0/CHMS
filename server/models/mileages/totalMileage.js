const mongoose = require('mongoose');

const MajorMileage = require('../mileages/majorMileage');
const StudentUser = require('../users/studentUser');
const Mileage = require('../mileages/mileage');

const TotalMileage = mongoose.Schema({
  user_num: { type: Number, required: true, unique: true },
  user_name: { type: String, required: true },
  year_of_study: { type: Number, required: true },
  mileage_score: [{
    code: { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.MajorMileage', required: true },
    score: { type: Number, required: true }
  }],
  total_score: { type: Number, required: true, default: 0 },
  last_update_date: { type: Date, required: true, default: Date.now }
}, {
  collection: 'TotalMileage'
});

TotalMileage.statics.create = function (data) {
  return Promise.resolve(this(data));
}

TotalMileage.methods.delScore = function (major_code, score) {
  for (let item of this.mileage_score) {
    if (item.code.description == major_code) {
      item.code.score -= score;
      this.save();
      return;
    }
  }
}

TotalMileage.methods.addScore = function (major_code, score) {
  let isExists = false;

  // 마일리지별 합계에서 해당하는 code를 찾음
  for (let item of this.mileage_score) {
    if (item.code.description == major_code) {
      // 찾았다.
      isExists = true;

      // 더해!
      item.code.score += score;
      // 저 - 장
      this.last_update_date = new Date();
      this.save();
      return;
    }
  }

  // 이런 마일리지는 처음 봤음.
  if (!isExists) {
    // 마일리지를 코드를 DB에서 찾아서
    return MajorMileage.findOneByCode(major_code).then(code => {
      // 추가
      this.mileage_score.push(
        {
          code,
          score
        }
      )
      // 저 - 장
      this.last_update_date = new Date();
      this.save();
    })
  }
}

// 모든 점수를 전부 날려버림
TotalMileage.methods.clearScore = function() {
  this.mileage_score = [];
  this.total_score = 0;
  this.last_update_date = new Date();
  return Promise.resolve(this.save());
}

TotalMileage.statics.findOneByUserNum = function (user_num) {
  //return this.findOne({user_num: user_num}).populate({path: 'mileage_score.code'});

  // 임시 코드 : 테이블이 없으면 추가해서 던져준다.
  return this.find({ user_num: user_num }).populate({ path: 'mileage_score.code' })
    .then(
      (docs) => {
        if (docs.length == 0) {
          return StudentUser.findOneByUserNum(user_num)
            .then(doc => {
              return TotalMileage.create({
                user_num: doc.user_num,
                user_name: doc.name,
                year_of_study: doc.year_of_study,
                mileage_score: []
              });
            }).then(doc => {
              return doc.save();
            });
        } else {
          return docs[0];
        }
      }
    ).then(() => {
      return this.resetScore();
    });
}

// 임시함수 : 총 합을 모든 마일리지 테이블에서 계산해서 넣어준다.
TotalMileage.methods.resetScore = function(user_num) {
  return this.clearScore().then(() => {
    return Mileage.findByUserNum(user_num);
  }).then(docs => {
    let promiseArray = [];

    for(var doc of docs) {
      let mileageCode = doc.code;
      promiseArray.push(this.addScore(mileageCode.code[0], mileageCode.score));
    }

    return Promise.all(promiseArray);
  })
}

TotalMileage.methods.toCustomObject = function () {
  return {
    id: this._id,
    user_num: this.user_num,
    user_name: this.user_name,
    year_of_study: this.year_of_study,
    //......
  }
}

module.exports = mongoose.model('TotalMileage', TotalMileage);