const mongoose = require('mongoose');

const MajorMileage = require('../mileages/majorMileage');
const StudentUser = require('../users/studentUser');
const Mileage = require('../mileages/mileage');

const TotalMileage = mongoose.Schema({
  user_num: { type: Number, required: true, unique: true },
  user_name: { type: String, required: true },
  year_of_study: { type: Number, required: true, default: 0 },
  a_total_score: { type: Number, required: true, default: 0 },
  b_total_score: { type: Number, required: true, default: 0 },
  c_total_score: { type: Number, required: true, default: 0 },
  d_total_score: { type: Number, required: true, default: 0 },
  e_total_score: { type: Number, required: true, default: 0 },
  f_total_score: { type: Number, required: true, default: 0 },
  g_total_score: { type: Number, required: true, default: 0 },
  total_score: { type: Number, required: true, default: 0 },
  last_update_date: { type: Date, required: true, default: Date.now }
}, {
  collection: 'TotalMileage'
});

TotalMileage.statics.create = function (data) {
  return Promise.resolve(new this(data));
}

TotalMileage.methods.delScore = function (major_code, score) {
  // 각 마일리지 메이져 코드를 찾아서 점수값을 뺀다.
  switch(major_code) {
    case 'A':
      this.a_total_score -= score;
      break;
    case 'B':
      this.b_total_score -= score;
      break;
    case 'C':
      this.c_total_score -= score;
      break;
    case 'D':
      this.d_total_score -= score;
      break;
    case 'E':
      this.e_total_score -= score;
      break;
    case 'F':
      this.f_total_score -= score;
      break;
    case 'G':
      this.g_total_score -= score;
      break;
  }
  // 토탈에서 뺌
  this.total_score -= score;
  this.last_update_date = new Date();
  return Promise.resolve(this.save());
}

TotalMileage.methods.addScore = function (major_code, score) {
    // 각 마일리지 메이져 코드를 찾아서 점수값을 더한다.
  switch(major_code) {
    case 'A':
      this.a_total_score += score;
      break;
    case 'B':
      this.b_total_score += score;
      break;
    case 'C':
      this.c_total_score += score;
      break;
    case 'D':
      this.d_total_score += score;
      break;
    case 'E':
      this.e_total_score += score;
      break;
    case 'F':
      this.f_total_score += score;
      break;
    case 'G':
      this.g_total_score += score;
      break;
  }
  // 토탈에서 더함
  this.total_score += score;
  this.last_update_date = new Date();
  return Promise.resolve(this.save());
}

// 모든 점수를 전부 날려버림
TotalMileage.methods.clearScore = function() {
  this.mileage_score = [];
  this.total_score = 0;
  this.last_update_date = new Date();
  return Promise.resolve(this.save());
}

TotalMileage.statics.findOneByUserNum = function (user_num) {
  //return this.findOne({user_num: user_num});

  // 임시 코드 : 테이블이 없으면 추가해서 던져준다.
  return this.find({ user_num: user_num })
    .then(
      (docs) => {
        if (docs.length == 0) {
          return StudentUser.findOneByUserNum(user_num)
            .then(doc => {
              return TotalMileage.create({
                user_num: doc.user_num,
                user_name: doc.name,
                year_of_study: doc.year_of_study
              });
            }).then(doc => {
              return doc.save();
            }).then(doc => {
              return doc.resetScore();
            });
        } else {
          return docs[0];
        }
      }
    ).then((doc) => {
      return doc;
    });
}

// 임시함수 : 총 합을 모든 마일리지 테이블에서 계산해서 넣어준다.
TotalMileage.methods.resetScore = function(user_num) {
  return Mileage.findByUserNum(user_num)
    .then(docs => {
      let promiseArray = [];

      for(var doc of docs) {
        let mileageCode = doc.code;
        promiseArray.push(this.addScore(mileageCode.code[0], mileageCode.score));
      }

      return Promise.all(promiseArray).then(()=> {
        this.last_update_date = new Date();
      });
  });
}

TotalMileage.methods.toCustomObject = function () {
  return {
    id: this._id,
    user_num: this.user_num,
    user_name: this.user_name,
    year_of_study: this.year_of_study,
    a_total_score: this.a_total_score,
    b_total_score: this.b_total_score,
    c_total_score: this.c_total_score,
    d_total_score: this.d_total_score,
    e_total_score: this.e_total_score,
    f_total_score: this.f_total_score,
    g_total_score: this.g_total_score,
    total_score: this.total_score,
    last_update_date: this.last_update_date,
  }
}

TotalMileage.statics.getCountwithFilter = function(filter) {
  return this.count(filter);
}

TotalMileage.statics.findWithFilter = function(filter, dataIndex) {
  // if start exists
  if(dataIndex){
    return this.find(filter).sort({ "total_score" : -1 }).skip(dataIndex.start).limit(dataIndex.count);
  }else{
    return this.find(filter).sort({ "total_score" : -1 });
  }
}

module.exports = mongoose.model('TotalMileage', TotalMileage);