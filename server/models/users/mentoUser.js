const mongoose = require('mongoose');
const Codetype = require('../codetype');

const User = require('./user');

const { filterNullInObject, cloneObject } = require('../../utils/utils');

// Define Schemes
const MentoUser = mongoose.Schema({
    user_num:   { type: Number, required: true, unique: true },
    user_type:  { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Usertype'},
    password:   { type: String, required: true },
    name:       { type: String, required: true },
    join_date:  { type: Date, default: Date.now },
    workplace:  { type: String },
    department: { type: String },
    job_position: { type: String }
  }, {
    collection: 'User'
  });

  MentoUser.statics.create = function(user_num, password, name, workplace, department, job_position) {
    return Codetype.Usertype.findOneByDescription('mento')
      .then(user_type => {
        
        return new this(filterNullInObject({
          user_num: user_num, 
          user_type: user_type,
          password: User.encrypt(password),
          name: name,
          workplace: workplace,
          department: department,
          job_position: job_position
        }))
      });
  }

  // 이름으로 멘토 검색
  MentoUser.statics.findByName = function(name) {
    return this.find({ name: name })
      .populate({ path: 'user_type', select: 'description' });
  }

  // customObject -> originObject
  MentoUser.statics.customObjectToOriginObject = function(customObj) {
    let doc = cloneObject(customObj);
    doc._id = doc.id;

    let promiseArray = [];

    if(customObj.user_type) { 
      promiseArray.push(Codetype.Usertype.findOneByDescription(customObj.user_type)
        .then(code => { doc.user_type = code; }));
    }

    return Promise.all(promiseArray).then(() => {return doc;});
  }

  /*
    MentoUser methods function 
  */
  MentoUser.methods.toCustomObject = function() {
    let result = filterNullInObject({
      id: this._id,
      user_num: this.user_num,
      user_type: this.user_type.description,
      password: this.password,
      name: this.name,
      join_date: this.join_date,
      workplace: this.workplace,
      department: this.department,
      job_position: this.job_position
    })

    return result;
  }
  
  MentoUser.methods.toCustomObjectByAuth = function(user_type) {
    let result;

    switch(user_type) {
      case 'admin':
        result = filterNullInObject({
          id: this._id,
          user_num: this.user_num,
          user_type: this.user_type.description,
          password: this.password,
          name: this.name,
          join_date: this.join_date,
          workplace: this.workplace,
          department: this.department,
          job_position: this.job_position
        })
        break;
      case 'student':
      case 'mento':
      case 'professor':
        result = filterNullInObject({
          user_num: this.user_num,
          user_type: this.user_type.description,
          name: this.name,
          join_date: this.join_date,
          workplace: this.workplace,
          department: this.department,
          job_position: this.job_position
        })
        break;
      default:
        result = filterNullInObject({
          user_type: this.user_type.description,
          name: this.name,
          join_date: this.join_date,
          workplace: this.workplace,
          department: this.department,
          job_position: this.job_position
        })
        break;
    }

    return result;
  }

  // password 검증
  MentoUser.methods.verifyPassword = function (password) {
    return this.password === encrypt(password);
  };
  
module.exports = mongoose.model('MentoUser', MentoUser);