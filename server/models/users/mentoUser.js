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
    job_position: { type: String },
    email:      { type: String, required: true},
    auth_key:   { type: String, required: true},
    auth_state: { type: mongoose.Schema.Types.ObjectId, ref: 'Codetype.Authstate'},
    new_email:  { type: String },
    new_password:     { type: String }
  }, {
    collection: 'User'
  });

  MentoUser.statics.create = function(user) {
    return Promise.all([
      Codetype.Usertype.findOneByDescription('mento'),
      Codetype.Authstate.findOneByDescription('unauthenticated'),
    ]).then(([user_type, auth_state]) => { 
      let auth_key = User.getAuthKey(user.user_num);

      return new this(filterNullInObject({
        user_num: user.user_num, 
        user_type: user_type,
        password: User.encrypt(user.password),
        name: user.name,
        workplace: user.workplace,
        department: user.department,
        job_position: user.job_position,
        email: user.email, 
        auth_key: auth_key,
        auth_state: auth_state,
      }))
    });
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

    if(customObj.auth_state) { 
      promiseArray.push(Codetype.Authstate.findOneByDescription(customObj.auth_state)
        .then(code => { doc.auth_state = code; }));
    }
    
    return Promise.all(promiseArray).then(() => {return doc;});
  }

  // 이메일 인증
  MentoUser.statics.authenticateEmail = function (auth_key) {
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

  MentoUser.statics.joinPromise = function(promise) {
    return promise.populate({ path: 'user_type', select: 'description'})
      .populate({ path: 'auth_state', select: 'description'})
  }

  // 이름으로 멘토 검색
  MentoUser.statics.findByName = function(name) {
    return this.joinPromise(this.find({ name: name }));
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
      job_position: this.job_position,
      email: this.email,
      auth_key: this.auth_key,
      auth_state: (this.auth_state)?this.auth_state.description:null,
    })

    return result;
  }
  
  MentoUser.methods.toCustomObjectByAuth = function(user_type) {
    let result;

    switch(user_type) {
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
          workplace: this.workplace,
          department: this.department,
          job_position: this.job_position,
          email: this.email,
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

  MentoUser.methods.isAuthenticated = function () {
    return (this.auth_state)?this.auth_state.description:null === 'unauthenticated';
  };

  MentoUser.methods.setAuthState = function (auth_state) {
    return Codetype.Authstate.findOneByDescription(auth_state)
      .then(code => {
        this.auth_state = code;
      })
  }

  MentoUser.methods.update = function(user) {
    this.set(user);
    this.save();
  }


  // password 검증
  MentoUser.methods.verifyPassword = function (password) {
    return this.password === encrypt(password);
  };
  
module.exports = mongoose.model('MentoUser', MentoUser);