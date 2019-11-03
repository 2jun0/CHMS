const mongoose = require('mongoose');
const crypto = require('crypto');

const AdminUser = require('./adminUser');
const StudentUser = require('./studentUser');
const MentoUser = require('./mentoUser');
const ProfessorUser = require('./professorUser');

encrypt = function (password) {
  return crypto.createHmac('sha512', process.env.SECRET_KEY).update(password).digest('hex');
}

// Define Schemes
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@주    의@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//
// 모든 User model에 있는 key를 정의해야함. (join(populate)를 더 빠르게 하기 위함.)
// update나 create시에는 다른 User model을 사용하기 때문에 문제가 없지만,
// 직접적으로 update나 save함수를 사용하지 말것!
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//
const User = mongoose.Schema({
  user_num:   { type: Number, required: true, unique: true },
  user_type:  { type: mongoose.Schema.Types.ObjectId, ref: 'Codetype.Usertype' },
  password:   { type: String, required: true },
  name:       { type: String, required: true },
  join_date:  { type:Date, default: Date.now },
  email:      { type: String },
  auth_key:   { type: String},
  auth_state: { type: mongoose.Schema.Types.ObjectId, ref: 'Codetype.Authstate'},
  year_of_study:    { type: Number },
  major_type: { type: mongoose.Schema.Types.ObjectId, ref: 'Codetype.Majortype'},
  major:      { type: String },
  workplace:  { type: String },
  department: { type: String },
  job_position: { type: String },
  department_type: { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Departmenttype' }
}, {
    collection: 'User'
  });
  // pre function
  User.pre(["deleteMany", "deleteOne", "findByIdAndDelete", "findByIdAndRemove", "findByIdAndUpdate", "findOneAndDelete", "findOneAndRemove", "findOneAndReplace", "findOneAndUpdate", "replaceOne", "updateMany", "updateOne"], function(next) {
    this.error(new Error("Do not call create, delete, update, though User schema"));
  });

  /*
    User static function 
  */
  User.statics.create = function (user_num, user_type, password, name) {
    delete arguments[1];
    switch(user_type) {
      case 'admin':
        return AdminUser.create.apply(this, arguments);
      case 'student':
        return StudentUser.create.apply(this, arguments);
      case 'professor':
        return ProfessorUser.create.apply(this, arguments);
      case 'mento':
        return MentoUser.create.apply(this, arguments);
      default:
        return null;
    }
  };

  User.statics.update = function (user_num, query) {
    return this.findOneByUserNum(user_num)
      .then(user => {
        switch(user.user_type.description) {
          case 'admin':
            return AdminUser.findOneAndUpdate({user_num: user_num}, query);
          case 'student':
            return StudentUser.findOneAndUpdate({user_num: user_num}, query);
          case 'professor':
            return ProfessorUser.findOneAndUpdate({user_num: user_num}, query);
          case 'mento':
            return MentoUser.findOneAndUpdate({user_num: user_num}, query);
          default:
            return null;
        }
      })
  }

  User.statics.updatePassword = function (user_num, new_password) {
    encoded_new_password = encrypt(new_password);

    return this.findOneByUserNum(user_num)
      .then(user => {

        if(encoded_new_password == user.password) {
          throw Error('변경할 비밀번호는 현재 비밀번호와 달라야 합니다.');
        }

        let query = {
          password: encoded_new_password
        }

        switch(user.user_type.description) {
          case 'admin':
            return AdminUser.findOneAndUpdate({user_num: user_num}, query);
          case 'student':
            return StudentUser.findOneAndUpdate({user_num: user_num}, query);
          case 'professor':
            return ProfessorUser.findOneAndUpdate({user_num: user_num}, query);
          case 'mento':
            return MentoUser.findOneAndUpdate({user_num: user_num}, query);
          default:
            return null;
        }
      })
  }

  User.statics.joinPromise = function(promise) {
    return promise.populate({ path: 'user_type', select: 'description'})
      .populate({ path: 'auth_state', select: 'description'})
      .populate({ path: 'major_type', select: 'description'})
      .populate({ path: 'department_type', select: 'description'});
  }

  // user 개수 검색
  User.statics.getCountWithFilter = function(filter) {
    return this.count(filter);
  };

  // filter 있는 user 검색
  User.statics.findWithFilter = function(dataIndex, filter) {
    if(filter){
        return this.joinPromise(this.find(filter).sort({ "join_date" : -1 }).skip(dataIndex.start).limit(dataIndex.count));
    }else{
        return this.joinPromise(this.find().sort({ "join_date" : -1 }).skip(dataIndex.start).limit(dataIndex.count));
    }
  };

  // 모든 user 검색
  User.statics.findAll = function () {
    return this.joinPromise(this.find({}));
  };

  // user_num에 의한 user 검색
  User.statics.findOneByUserNum = function (user_num) {
    return this.joinPromise(this.findOne({ user_num: user_num }))
      .then(doc => {
        if(doc) {
          switch(doc.user_type.description) {
            case 'admin':
              return AdminUser(doc);
            case 'student':
              return StudentUser(doc);
            case 'mento':
              return MentoUser(doc);
            case 'professor':
              return ProfessorUser(doc);
            default:
              return doc;
          }
        }else{
          return null;
        }
      });
  };

  // id에 의한 user 검색
  User.statics.findOneById = function (id) {
    return this.joinPromise(this.findOne({ _id : id}));
  }

  // Delete by user_num
  User.statics.deleteOneByUserNum = function (user_num) {
    return this.deleteOne({user_num: user_num});
  }

  User.statics.customObjectToOriginObject = function(user_type, customObj) {
    switch(user_type) {
      case 'admin':
        return AdminUser.customObjectToOriginObject(customObj);
      case 'student':
        return StudentUser.customObjectToOriginObject(customObj);
      case 'mento':
        return MentoUser.customObjectToOriginObject(customObj);
      case 'professor':
        return ProfessorUser.customObjectToOriginObject(customObj);
    }
  }

  User.statics.findOneByAuthKey = function (auth_key) {
    return this.joinPromise(this.findOne({ auth_key: auth_key}))
      .then(doc => {
        if(doc) {
          switch(doc.user_type.description) {
            case 'student':
              return StudentUser(doc);
            case 'mento':
              return MentoUser(doc);
            case 'professor':
              return ProfessorUser(doc);
            default:
              return doc;
          }
        }else{
          return null;
        }
      });
  };

  // 이메일 인증
  User.statics.authenticateEmail = function (auth_key) {
    return this.findOneByAuthKey(auth_key)
      .then(user => {
        if(!user) return null;
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

  /*
    User methods function 
  */
  User.methods.toCustomObject = function () {
    switch(this.user_type.description) {
      case 'admin':
        return AdminUser(this).toCustomObject();
      case 'student':
        return StudentUser(this).toCustomObject();
      case 'mento':
        return MentoUser(this).toCustomObject();
      case 'professor':
        return ProfessorUser(this).toCustomObject();
    }
  }

  User.methods.toCustomObjectByAuth = function (user_type) {
    switch(this.user_type.description) {
      case 'admin':
        return AdminUser(this).toCustomObjectByAuth(user_type);
      case 'student':
        return StudentUser(this).toCustomObjectByAuth(user_type);
      case 'mento':
        return MentoUser(this).toCustomObjectByAuth(user_type);
      case 'professor':
        return ProfessorUser(this).toCustomObjectByAuth(user_type);
    }
  }

  // password 검증
  User.methods.verifyPassword = function (password) {
    return this.password === encrypt(password);
  };

  // Admin, Student, Mento assign
  User.statics.Admin = AdminUser;
  User.statics.Student = StudentUser;
  User.statics.Mento = MentoUser;
  User.statics.Professor = ProfessorUser;

// Create Model & Export
module.exports = mongoose.model('User', User);
exports.getAuthKey = (user_num) => {
  return crypto.createHmac('sha512', process.env.AUTH_SECRET_KEY).update(user_num).digest('hex');
};
exports.encrypt = encrypt;

