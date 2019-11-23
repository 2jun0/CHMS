const router = require('express').Router();
const User = require('../models/users/user');
const Codetype = require('../models/codetype');
// middlewares
const { isAuthenticated, verifyUserTypes, isAuthenticatedButNotError, isSelf, forceByAdmin } = require('../middlewares/auth');
const { doesUserExist } = require('../middlewares/user');
const { checkUserUpdate } = require('../middlewares/validator/user');
// utils
const { getRandomString } = require('../utils/utils');
const { createFilter, addCodetypeToFilter } = require('../utils/query/filter');
const { sendAuthEmail, sendNewPasswordEmail } = require('../utils/email-auth');

/*
  사용자 검색
  POST /user/get-user
  JWT token / user_num
*/
router.post('/get-user', isAuthenticatedButNotError, (req, res) => {
  console.log('[POST] /user/get-user');
  const {user_num} = req.body;

  // Find user doc by user_num
  User.findOneByUserNum(user_num)
    .then(doc => {
      return doc.toCustomObjectByAuth(req.decodedToken.user_type);
    }).then(obj => {
      res.send(obj);
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  모든 사용자 개수 검색
  POST /user/get-all-user-count
  JWT admin, student, mento, professor token / _filter { name, user_num, join_date, user_type }
*/
router.post('/get-all-user-count', isAuthenticated, verifyUserTypes(['admin', 'student', 'mento', 'professor']), (req, res) => {
  console.log('[POST] /user/get-all-user-count');
  const { _filter } = req.body;

  // Get filter
  getFilterOfAllUser(_filter)
    .then(filter => {
      // Get count of all users
      return User.getCountWithFilter(filter)
    }).then(count => {
      res.send(''+count);
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  모든 사용자 검색
  POST /user/get-all-users
  JWT admin, student, mento, professor Token / _filter { name, user_num, join_date, user_type }
*/
router.post('/get-all-users', isAuthenticated, verifyUserTypes(['admin', 'student', 'mento', 'professor']), (req, res) => {
  console.log('[POST] /user/all-users');
  const { _dataIndex, _filter } = req.body;

  // Get filter
  getFilterOfAllUser(_filter)
    .then(filter => {
      // Get all users
      return User.findWithFilter(_dataIndex, filter)
    }).then(docs => {
      // Convert docs to objs
      let objs = [];
      for (var i = 0; i < docs.length; i++) {
        objs.push(docs[i].toCustomObjectByAuth(req.decodedToken.user_type));
      }

      return objs;
    }).then(objs => {
      res.send(objs);
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  사용자 정보 수정
  POST /user/update-user
  JWT Token admin, userself / user_num, user
*/
router.post('/update-user', isAuthenticated, doesUserExist('user_num'),
  forceByAdmin([isSelf]), checkUserUpdate('user'), (req, res) => {
  console.log('[POST] /user/update-user');

  const { user_num, user } = req.body;

  User.customObjectToOriginObject(req.user.user_type.description, user)
    .then(doc => {
      delete doc._id;

      if(['student', 'professor', 'mento'].includes(req.user.user_type.description)) {
        const prevEmail = req.user.email;

        // email change detect!
        if(doc.email && prevEmail != doc.email) {
          doc.new_email = doc.email;
          delete doc.email;

          req.user.update(doc);

          sendAuthEmail(doc.new_email, doc.name, req.user.auth_key);
          return req.user.setAuthState('email-changed');
        }
      }

      // update user doc
      req.user.set(doc);
      return req.user.save();
    }).then(() => {
      res.json({ success: true })
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  사용자 비밀번호 수정
  POST /user/update-password
  JWT Token admin, userself / user_num, cur_password, new_password, repeat_new_password
*/
router.post('/update-password', isAuthenticated, doesUserExist('user_num'), forceByAdmin(isSelf), (req, res) => {
  console.log('[POST] /user/update-password');
  const token = req.decodedToken;

  const { user_num, cur_password, new_password, repeat_new_password } = req.body;
  const user = req.user;

  // validation
  if(new_password !== repeat_new_password) {
    res.status(403).json({ success: false, message: '새 비밀번호가 일치하지 않습니다.' });
  }

  if(token.user_type != 'admin') {
    if(!user.verifyPassword(cur_password)) {
      res.status(403).json({ success: false, message: '현재 비밀번호가 일치하지 않습니다.' });
    }
  }

  // update user collection
  User.updatePassword(user_num, new_password)
    .then(() => {
      if(token.user_type == 'admin') {
        sendNewPasswordEmail(user.email, user.name, new_password);
      }

      res.json({ success: true })
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  사용자 비밀번호 랜덤수정
  POST /user/update-random-password
  JWT Token all / user_num
*/
router.post('/update-random-password', doesUserExist('user_num'), (req, res) => {
  console.log('[POST] /user/update-random-password');
  const { user } = req;
  const { user_num } = req.body;
  const new_password = getRandomString(10);

  User.setNewPassword(user_num, new_password).then(() => {
    sendNewPasswordEmail(user.email, user.name, new_password);
    
    res.json({ success: true });
  }).catch(err => {
    res.status(403).json({ success: false, message: err.message });
    console.log(err);
  });
});

/*
  사용자 정보 삭제 [delete user data]
  POST /user/delete
  JWT Token admin / user_num
*/
// required only 'admin' token auth
router.post('/delete', isAuthenticated, doesUserExist('user_num'), verifyUserTypes(['admin']), (req, res) => {
  console.log('[POST] /user/delete');
  const { user } = req;

  user.setAuthState('disabled').then(() => {
    res.json({ success: true });
  }).catch(err => {
    res.status(403).json({ success: false, message: err.message });
    console.log(err);
  });
});

/*
  학과 코드 다운로드
  GET /user/get-department-types
  nothing
*/
router.get('/get-department-types', (req, res) => {
  console.log('[GET] /user/get-department-types');
  Codetype.Departmenttype.findAll()
    .then((doc_codes) => {
      let objs = [];
      for(let doc of doc_codes) {
        objs.push(doc.toCustomObject());
      }
      return res.send(objs);
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  학과 코드 다운로드
  GET /user/get-college-types
  nothing
*/
router.get('/get-college-types', (req, res) => {
  console.log('[GET] /user/get-college-types');
  Codetype.Collegetype.findAll()
    .then((doc_codes) => {
      let objs = [];
      for(let doc of doc_codes) {
        objs.push(doc.toCustomObject());
      }
      return res.send(objs);
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

function getFilterOfAllUser(_filter) {
  return new Promise((resolve, reject) => {
    let filter;
    if (_filter) {
      filter = createFilter({
        name: _filter.name,
        user_num: _filter.user_num,
        join_date: _filter.join_date
      })

      return addCodetypeToFilter(filter, 'user_type', _filter.user_type, Codetype.Usertype)
        .then(() => {
          resolve(filter);
        })
    } else {
      filter = {};
      resolve(filter);
    }
  });
}

module.exports = router;