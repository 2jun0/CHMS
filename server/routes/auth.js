const router = require('express').Router();
const { check, validationResult } = require('express-validator');

const { createToken } = require('../lib/token');
// middlewares
const { isAuthenticated } = require('../middlewares/auth');
const { checkStudentUser, checkProfessorUser, checkMentoUser } = require('../middlewares/validator/user');
// model
const User = require('../models/users/user');
// utils
const { sendAuthEmail } = require('../utils/email-auth');

router.get('/', (req, res) => {
  res.send('auth router');
});

/*
  join student
  POST /auth/join/student
  everyone / user
*/
router.post('/join/student', checkStudentUser('user', true), (req, res) => {
  const { user } = req.body;

  User.findOneByUserNum(user.user_num)
    .then(doc => {
      if (doc) {
        throw new Error(`사용자번호 ${user.user_num}는 이미 가입되어 있습니다.`);
      } else {
        User.Student.create(user)
          .then(doc => {
            sendAuthEmail(doc.email, doc.name, doc.auth_key);
            return doc.save();
          }).catch(err => {
            throw err;
          });
      }
    })
    .then(() => res.json({ success: true }))
    .catch(err => {
      res.status(409).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  join mento
  POST /auth/join/mento
  everyone / user
*/
router.post('/join/mento', checkMentoUser('user', true), (req, res) => {
  const { user } = req.body;

  User.findOneByUserNum(user.user_num)
    .then(doc => {
      if (doc) {
        throw new Error(`사용자번호 ${user.user_num}는 이미 가입되어 있습니다.`);
      } else {
        User.Mento.create(user)
          .then(doc => {
            sendAuthEmail(doc.email, doc.name, doc.auth_key);
            return doc.save();
          }).catch(err => {
            res.status(409).json({ success: false, message: err.message });
            console.log(err);
          });
      }
    })
    .then(() => res.json({ success: true }))
    .catch(err => {
      res.status(409).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  join professor
  POST /auth/join/professor
  everyone / user
*/
router.post('/join/professor', checkProfessorUser('user', true), (req, res) => {
  const { user } = req.body;

  User.findOneByUserNum(user.user_num)
    .then(doc => {
      if (doc) {
        if(doc.auth_state.description == 'disabled') {
          throw new Error(`사용자 번호 ${user.user_num}으로 가입할 수 없습니다.`);
        }

        throw new Error(`사용자 번호 ${user.user_num}는 이미 가입되어 있습니다.`);
      } else {
        User.Professor.create(user)
          .then(doc => {
            sendAuthEmail(doc.email, doc.name, doc.auth_key);
            return doc.save();
          }).catch(err => {
            res.status(409).json({ success: false, message: err.message });
            console.log(err);
          });
      }
    })
    .then(() => res.json({ success: true }))
    .catch(err => {
      res.status(409).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  login
  POST /auth/login
  { user_num, password }
*/
router.post('/login', [
  // validation
  check('user_num')
    .exists().withMessage('사용자번호을 입력해주세요!')
    .matches(/[0-9]+/).withMessage('사용자번호는 숫자로만 입력해야 합니다!'),
  check('password')
    .exists().withMessage('비밀번호를 입력해주세요!')
    .isLength({ min:6, max:16 }).withMessage('비밀번호는 영문또는 숫자로 입력해야 합니다!')
    .matches(/[a-zA-Z0-9!@#$%^&*]+/).withMessage('비밀번호는 최소 6자, 최대16자로 입력해야 합니다!')
],
(req, res) => {
  const { user_num, password } = req.body;

  // user_num에 의한 user 검색
  User.findOneByUserNum(user_num)
    .then(user => {
      // user 미존재: 회원 미가입 사용자
      if (!user) { throw new Error('가입하지 않은 사용자 입니다.'); }
      
      // 비밀번호 체크
      if (!user.verifyPassword(password)) {
        // 비밀번호 바꾼건가요?
        if (!user.verifyNewPassword(password)) {
          throw new Error('비밀번호가 일치하지 않습니다.'); 
        }else{
          user.password = user.new_password;
          user.save();
        }
      }

      // 이메일 인증 체크
      if (user.user_type.description !== 'admin') {
        if (user.auth_state.description === 'unauthenticated') { throw new Error('이메일을 인증한 뒤, 로그인을 해주세요.'); }
        if (user.auth_state.description === 'disabled') { throw new Error('가입하지 않은 사용자 입니다.'); }
      }

      // 토큰 발행
      let token = user.toCustomObject();
      token.__isAuthToken = true;
      return createToken(token);
    })
    .then(token => {
      res.json({ success: true, token })
    })
    .catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
  });
});

/*
  re-login
  GET /auth/re-login
  { token }
*/
router.get('/re-login', isAuthenticated, (req, res) => {
  const token = req.decodedToken;

  // user_num에 의한 user 검색
  User.findOneByUserNum(token.user_num)
    .then(user => {
      // user 미존재: 회원 미가입 사용자
      if (!user) { throw new Error('가입하지 않은 사용자 입니다.'); }
      
      // 이메일 인증 체크
      if (user.user_type.description === 'student') {
        if (user.auth_state.description === 'unauthenticated') { throw new Error('이메일을 인증한 뒤, 로그인을 해주세요.'); }
      }

      // 토큰 발행
      let token = user.toCustomObject();
      token.__isAuthToken = true;
      return createToken(token);
    })
    .then(token => {
      res.json({ success: true, token })
    })
    .catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
  });
});

/*
  email-auth
  POST /auth/email-auth
  auth_key
*/
router.post('/email-auth', (req, res) => {
  const { auth_key } = req.body;
  // 이메일 인증
  User.authenticateEmail(auth_key)
    .then((user) => {
      if(user) {
        throw new Error('존재하지 않는 사용자 입니다.');
      }
      res.json({ success: true })
    })
    .catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
  });
});

/*
  header의 Authorization에 JWT 값을 설정하여 서버로 전송하면 서버는 token을 검증한 후 현재 계정의 상태를 response한다.
  GET /auth/check
  JWT Token
*/
router.get('/check', isAuthenticated, (req, res) => {
  res.json(req.decodedToken);
});

module.exports = router;