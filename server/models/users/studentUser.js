const mongoose = require('mongoose');
const Codetype = require('../codetype');

const User = require('./user');
const Mileage = require('../mileages/mileage');
const TotalMileage = require('../mileages/totalMileage');

const { filterNullInObject, cloneObject } = require('../../utils/utils');

// Define Schemes
const StudentUser = mongoose.Schema({
    user_num:   { type: Number, required: true, unique: true },
    user_type:  { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Usertype'},
    password:   { type: String, required: true },
    name:       { type: String, required: true },
    join_date:  { type: Date, default: Date.now },
    year_of_study:    { type: Number, required: true },
    major_type: { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Majortype'},
    department_type:  { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Departmenttype'},
    github_id:  { type: String, required: true},
    email:      { type: String, required: true},
    auth_key:   { type: String, required: true},
    auth_state: { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Authstate'},
    new_email:  { type: String },
    new_password:     { type: String }
  }, {
    collection: 'User'
  });
  
  /*
    StudentUser static function 
  */
  StudentUser.statics.create = function (user) {
    // 비밀번호 암호화
    return Promise.all([
      Codetype.Usertype.findOneByDescription('student'),
      Codetype.Authstate.findOneByDescription('unauthenticated'),
      Codetype.Majortype.findOneByDescription(user.major_type),
      Codetype.Departmenttype.findOneByDescription(user.department_type)
    ]).then(([user_type, auth_state, major_type, department_type]) => { 
      let auth_key = User.getAuthKey(user.user_num);
      
      student = new this(filterNullInObject({ 
        user_num: user.user_num,
        user_type: user_type,
        password: User.encrypt(user.password),
        name: user.name,
        year_of_study: user.year_of_study,
        major_type: major_type,
        department_type: department_type,
        email: user.email,
        github_id: user.github_id,
        auth_key: auth_key,
        auth_state: auth_state,
      }));
      return student;
    });
  };

  // customObject -> originObject
  StudentUser.statics.customObjectToOriginObject = function(customObj) {
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

    if(customObj.major_type) { 
      promiseArray.push(Codetype.Majortype.findOneByDescription(customObj.major_type)
        .then(code => { doc.major_type = code; }));
    }

    if(customObj.department_type) { 
      promiseArray.push(Codetype.Departmenttype.findOneByDescription(customObj.department_type)
        .then(code => { doc.department_type = code; }));
    }

    return Promise.all(promiseArray).then(() => { return doc;});
  }

  // User document를 StudentUser document로 변환
  StudentUser.statics.userToStudent = function(user) {
    studentUser = this(user);

    return Promise.all([
      Codetype.Authstate.findById(studentUser.auth_state),
      Codetype.Majortype.findById(studentUser.major_type)
    ]).then(([auth_state, major_type]) => {
      studentUser.auth_state = auth_state;
      studentUser.major_type = major_type;
      return studentUser;
    });
  };

  StudentUser.statics.joinPromise = function(promise) {
    return promise.populate({ path: 'user_type', select: 'description'})
      .populate({ path: 'auth_state', select: 'description'})
      .populate({ path: 'major_type', select: 'description'})
      .populate({ path: 'department_type', select: 'description' })
  }

  // user(student) 검색
  StudentUser.statics.findOneByUserNum = function (user_num) {
    return this.joinPromise(this.findOne({ user_num: user_num}));
  };

  // 모든 학생 검색
  StudentUser.statics.find = function (filter) {
    const User = require('./user');

    return Codetype.Usertype.findOneByDescription('student')
      .then(code => {
        filter.user_type = code;
        return User.find(filter);
      });
  };
  /*
    StudentUser methods function 
  */
  // student user model -> object
  StudentUser.methods.toCustomObject = function() {
    let result = filterNullInObject({
      id: this._id,
      user_num: this.user_num,
      user_type: this.user_type.description,
      password: this.password,
      name: this.name,
      email: this.email,
      github_id: this.github_id,
      auth_key: this.auth_key,
      auth_state: (this.auth_state)?this.auth_state.description:null,
      join_date: this.join_date,
      year_of_study: this.year_of_study,
      major_type: (this.major_type)?this.major_type.description:null,
      department_type: (this.department_type)?this.department_type.description:null
    });

    return result;
  }

  // student user model -> object by auth
  StudentUser.methods.toCustomObjectByAuth = function(user_type) {
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
          year_of_study: this.year_of_study,
          major_type: (this.major_type)?this.major_type.description:null,
          department_type: (this.department_type)?this.department_type.description:null,
          email: this.email,
          github_id: this.github_id,
        })
        break;
      default:
        result = filterNullInObject({
          user_type: this.user_type.description,
          name: this.name,
          join_date: this.join_date,
          year_of_study: this.year_of_study,
          major_type: (this.major_type)?this.major_type.description:null,
          department_type: (this.department_type)?this.department_type.description:null,
        })
        break;
    }
    return result;
  }

  StudentUser.methods.isAuthenticated = function () {
    return (this.auth_state)?this.auth_state.description:null === 'unauthenticated';
  };

  StudentUser.methods.setAuthState = function (auth_state) {
    return Codetype.Authstate.findOneByDescription(auth_state)
      .then(code => {
        this.auth_state = code;
      })
  }

  StudentUser.methods.update = function (user) {
    const prevName = this.name;
    const prevYearOfStudy = this.year_of_study;
    const prevDepartment = this.department_type;

    // 만약, 위의 세개 중에 변경된 점이 있으면, 마일리지를 수정해야 한다.
    if (prevName != user.name || prevYearOfStudy != user.year_of_study || prevDepartment.description != user.department_type.description) {
      // 이게 전부 수정하는 것이고 하나만 수정하는 것은 updateOne
      Mileage.update({user_num: this.user_num}, {name: user.name, year_of_study: user.year_of_study, department_type: user.department_type });
      TotalMileage.update({user_num: this.user_num}, {name: user.name, year_of_study: user.year_of_study });
    }

    this.set(user);
    this.save();
  }

  // password 검증
  StudentUser.methods.verifyPassword = function (password) {
    return this.password === encrypt(password);
  };

  // new password 검증
  StudentUser.methods.verifyNewPassword = function (new_password) {
    return this.new_password === encrypt(new_password);
  };

module.exports = mongoose.model('StudentUser',StudentUser);
