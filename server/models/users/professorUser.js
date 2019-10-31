const mongoose = require('mongoose');
const Codetype = require('../codetype');

const User = require('./user');

const { filterNullInObject, cloneObject } = require('../../utils/utils');

// Define Schemes
const ProfessorUser = mongoose.Schema({
  user_num: { type: Number, required: true, unique: true },
  user_type: { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Usertype' },
  password: { type: String, required: true },
  name: { type: String, required: true },
  major: { type: String },
  join_date: { type: Date, default: Date.now },
  department_type: { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Majortype' }
}, {
    collection: 'User'
  });

  ProfessorUser.statics.create = function (user_num, password, name, major, department_type) {
    return Promise.all([
      Codetype.Usertype.findOneByDescription('professor'),
      Codetype.Majortype.findOneByDescription(department_type)
    ]).then(([user_type, department_type]) => {

        return new this(filterNullInObject({
          user_num: user_num,
          user_type: user_type,
          password: User.encrypt(password),
          name: name,
          major: major,
          department_type: department_type
        }))
      });
  }

  // 이름으로 교수 검색
  ProfessorUser.statics.findByName = function (name) {
    return this.find({ name: name })
      .populate({ path: 'user_type', select: 'description' })
      .populate({ path: 'department_type', select: 'description' });
  }

  // customObject -> originObject
  ProfessorUser.statics.customObjectToOriginObject = function(customObj) {
    let doc = cloneObject(customObj);
    doc._id = doc.id;

    let promiseArray = [];

    if(customObj.user_type) { 
      promiseArray.push(Codetype.Usertype.findOneByDescription(customObj.user_type)
        .then(code => { doc.user_type = code; }));
    }

    if(customObj.department_type) { 
      promiseArray.push(Codetype.Majortype.findOneByDescription(customObj.department_type)
        .then(code => { doc.department_type = code; }));
    }

    return Promise.all(promiseArray).then(() => {return doc;});
  }

  /*
    ProfessorUser methods function 
  */
  ProfessorUser.methods.toCustomObject = function () {
    let result = filterNullInObject({
      id: this._id,
      user_num: this.user_num,
      user_type: this.user_type.description,
      password: this.password,
      name: this.name,
      join_date: this.join_date,
      major: this.major,
      department_type: (this.department_type)?this.department_type.description:null
    });

    return result;
  }

  ProfessorUser.methods.toCustomObjectByAuth = function (user_type) {
    let result;
    switch (user_type) {
      case 'admin':
        result = filterNullInObject({
          id: this._id,
          user_num: this.user_num,
          user_type: this.user_type.description,
          password: this.password,
          name: this.name,
          join_date: this.join_date
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
          major: this.major,
          department_type: (this.department_type)?this.department_type.description:null
        })
        break;
      default:
        result = filterNullInObject({
          user_type: this.user_type.description,
          name: this.name,
          join_date: this.join_date,
          major: this.major,
          department_type: (this.department_type)?this.department_type.description:null
        })
        break;
    }

    return result;
  }

  // password 검증
  ProfessorUser.methods.verifyPassword = function (password) {
    return this.password === User.encrypt(password);
  };

  // update password
  ProfessorUser.methods.updatePassword = function (password) {
    this.password = User.encrypt(password);
  }

module.exports = mongoose.model('ProfessorUser', ProfessorUser)