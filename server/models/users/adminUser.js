const mongoose = require('mongoose');

const { filterNullInObject, cloneObject } = require('../../utils/utils');

const AdminUser = mongoose.Schema({
  user_num:   { type: Number, required: true, unique: true },
  user_type:  { type: mongoose.Schema.Types.ObjectId, ref: 'Codetype.Usertype' },
  password:   { type: String, required: true },
  name:       { type: String, required: true }
}, {
    collection: 'User'
	});

  // customObject -> originObject
  AdminUser.statics.customObjectToOriginObject = function(customObj) {
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
    AdminUser methods function 
  */
  AdminUser.methods.toCustomObject = function() {
    let result = filterNullInObject({
      id: this._id,
      user_num: this.user_num,
      user_type: this.user_type.description,
      password: this.password,
      name: this.name,
    })

    return result;
  }
  
  AdminUser.methods.toCustomObjectByAuth = function(user_type) {
    let result;

    switch(user_type) {
      case 'admin':
        result = filterNullInObject({
          id: this._id,
          user_num: this.user_num,
          user_type: this.user_type.description,
          password: this.password,
          name: this.name,
        })
        break;
      default:
        result = null;
    }

    return result;
  }

  // password 검증
  AdminUser.methods.verifyPassword = function (password) {
    return this.password === encrypt(password);
  };
  
module.exports = mongoose.model('AdminUser', AdminUser);