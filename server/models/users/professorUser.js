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
  department_type: { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Departmenttype' },
  email:      { type: String, required: true},
  auth_key:   { type: String, required: true},
  auth_state: { type: mongoose.Schema.Types.ObjectId, ref: 'Codetype.Authstate'},
  new_email:  { type: String },
  new_password:     { type: String }
}, {
    collection: 'User'
  });

  ProfessorUser.statics.create = function (user) {
    return Promise.all([
      Codetype.Usertype.findOneByDescription('professor'),
      Codetype.Authstate.findOneByDescription('unauthenticated'),
      Codetype.Departmenttype.findOneByDescription(user.department_type)
    ]).then(([user_type, auth_state, department_type]) => {
      let auth_key = User.getAuthKey(user.user_num);

      return new this(filterNullInObject({
        user_num: user.user_num,
        user_type: user_type,
        password: User.encrypt(user.password),
        name: user.name,
        major: user.major,
        department_type: department_type,
        email: user.email,
        auth_key: auth_key,
        auth_state: auth_state,
      }))
    });
  }

  
  // 이메일 인증
  ProfessorUser.statics.authenticateEmail = function (auth_key) {
    return this.findOneByAuthKey(auth_key)
    .then(user => {
      //이미 인증한 사용자
      if (user.auth_state.description === 'authenticated') {
        // nothing....
        // 인증 안한 사용자
      }else if (user.auth_state.description === 'email-changed') {
        user.email = user.new_email;
        user.new_email = null;
        
        user.setAuthState('authenticated')
        .then(() => { return user.save(); });
      }else if (user.auth_state.description === 'unauthenticated') {
        // 인증상태 변경
        user.setAuthState('authenticated')
        .then(() => { return user.save(); });
      }
    });
  };
  
  ProfessorUser.statics.joinPromise = function(promise) {
    return promise.populate({ path: 'user_type', select: 'description'})
    .populate({ path: 'auth_state', select: 'description'})
    .populate({ path: 'department_type', select: 'description'})
  }
  
  // 이름으로 교수 검색
  ProfessorUser.statics.findByName = function (name) {
    return this.joinPromise(this.find({ name: name }));
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

    if(customObj.auth_state) { 
      promiseArray.push(Codetype.Authstate.findOneByDescription(customObj.auth_state)
        .then(code => { doc.auth_state = code; }));
    }

    if(customObj.department_type) { 
      promiseArray.push(Codetype.Departmenttype.findOneByDescription(customObj.department_type)
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
      department_type: (this.department_type)?this.department_type.description:null,
      email: this.email,
      auth_key: this.auth_key,
      auth_state: (this.auth_state)?this.auth_state.description:null,
    });

    return result;
  }

  ProfessorUser.methods.toCustomObjectByAuth = function (user_type) {
    let result;
    switch (user_type) {
      case 'admin':
        result = this.toCustomObject();
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
          department_type: (this.department_type)?this.department_type.description:null,
          email: this.email
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

  ProfessorUser.methods.isAuthenticated = function () {
    return (this.auth_state)?this.auth_state.description:null === 'unauthenticated';
  };

  ProfessorUser.methods.setAuthState = function (auth_state) {
    return Codetype.Authstate.findOneByDescription(auth_state)
      .then(code => {
        this.auth_state = code;
      })
  }

  // password 검증
  ProfessorUser.methods.verifyPassword = function (password) {
    return this.password === User.encrypt(password);
  };

  // update password
  ProfessorUser.methods.updatePassword = function (password) {
    this.password = User.encrypt(password);
  }

  // new password 검증
  ProfessorUser.methods.verifyNewPassword = function (new_password) {
    return this.new_password === encrypt(new_password);
  };

module.exports = mongoose.model('ProfessorUser', ProfessorUser)