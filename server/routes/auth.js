const router = require('express').Router();

const User = require('../models/users/user');

const { check, validationResult } = require('express-validator');
const { createToken } = require('../lib/token');
const { isAuthenticated } = require('../middlewares/auth');
const { sendAuthEmail } = require('../utils/email-auth');

router.get('/', (req, res) => {
  res.send('auth router');
});

/*
  join student
  POST /auth/join/student
  { user_num, password, name, repeat_password, email, year_of_study, major_type }
*/
router.post('/join/student', [
  // validation
  check('user_num')
    .exists().withMessage('사용자 번호를 입력해주세요!')
    .isInt().withMessage('사용자번호는 숫자로만 입력해야 합니다!'),
  check('password')
    .exists().withMessage('비밀번호를 입력해주세요!')
    .isLength({ min:6, max:16 }).withMessage('비밀번호는 영문또는 숫자로 입력해야 합니다!')
    .matches(/[a-zA-Z0-9!@#$%^&*]+/).withMessage('비밀번호는 최소 6자, 최대16자로 입력해야 합니다!')
    .custom((value, { req }) => value === req.body.repeat_password).withMessage('비밀번호가 일치하지 않습니다.'),
  check('name')
    .exists().withMessage('이름을 입력해주세요!')
    .matches(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/).withMessage('이름은 한글(2~4)이나 알파벳(2~10)으로 이루어져야 합니다.'),
  check('email')
    .exists().withMessage('이메일을 입력해주세요!')
    .isEmail().withMessage('이메일 형식을 확인해주세요!'),
  check('year_of_study')
    .exists().withMessage('학년을 입력해주세요!')
    .isNumeric().withMessage('학년 형식을 확인해주세요!'),
  check('major_type')
    .exists().withMessage('전공을 입력해주세요!')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: errors.errors[0].msg });
  }

  const { user_num, password, name, email, year_of_study, major_type} = req.body;

  User.findOneByUserNum(user_num)
    .then(user => {
      if (user) {
        throw new Error(`사용자번호 ${user_num}는 이미 가입되어 있습니다.`);
      } else {
        User.Student.create(user_num, password, name, email, year_of_study, major_type)
          .then(student_user => {
            sendAuthEmail(email, name, student_user.auth_key);
            return student_user.save();
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
  { user_num, password, name, repeat_password, workplace, department, job_position }
*/
router.post('/join/mento', [
  // validation
  check('user_num')
    .exists().withMessage('사용자 번호를 입력해주세요!')
    .matches(/[0-9]+/).withMessage('사용자번호는 숫자로만 입력해야 합니다!'),
  check('password')
    .exists().withMessage('비밀번호를 입력해주세요!')
    .isLength({ min:6, max:16 }).withMessage('비밀번호는 영문또는 숫자로 입력해야 합니다!')
    .matches(/[a-zA-Z0-9!@#$%^&*]+/).withMessage('비밀번호는 최소 6자, 최대16자로 입력해야 합니다!')
    .custom((value, { req }) => value === req.body.repeat_password).withMessage('비밀번호가 일치하지 않습니다.'),
  check('name')
    .exists().withMessage('이름을 입력해주세요!')
    .matches(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/)
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: errors.errors[0].msg });
  }

  const { user_num, password, name, workplace, department, job_position} = req.body;

  User.findOneByUserNum(user_num)
    .then(user => {
      if (user) {
        throw new Error(`사용자번호 ${user_num}는 이미 가입되어 있습니다.`);
      } else {
        User.Mento.create(user_num, password, name, workplace, department, job_position)
          .then(mento_user => {
            return mento_user.save();
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
  { user_num, password, name, repeat_password, major, department_type }
*/
router.post('/join/professor', [
  // validation
  check('user_num')
    .exists().withMessage('사용자 번호를 입력해주세요!')
    .matches(/[0-9]+/).withMessage('사용자번호는 숫자로만 입력해야 합니다!'),
  check('password')
    .exists().withMessage('비밀번호를 입력해주세요!')
    .isLength({ min:6, max:16 }).withMessage('비밀번호는 영문또는 숫자로 입력해야 합니다!')
    .matches(/[a-zA-Z0-9!@#$%^&*]+/).withMessage('비밀번호는 최소 6자, 최대16자로 입력해야 합니다!')
    .custom((value, { req }) => value === req.body.repeat_password).withMessage('비밀번호가 일치하지 않습니다.'),
  check('name')
    .exists().withMessage('이름을 입력해주세요!')
    .matches(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: errors.errors[0].msg });
  }

  const { user_num, password, name, major, department_type} = req.body;

  User.findOneByUserNum(user_num)
    .then(user => {
      if (user) {
        throw new Error(`사용자 번호 ${user_num}는 이미 가입되어 있습니다.`);
      } else {
        User.Professor.create(user_num, password, name, major, department_type)
          .then(professor_user => {
            return professor_user.save();
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
      if (!user.verifyPassword(password)) { throw new Error('비밀번호가 일치하지 않습니다.'); }

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
  { auth_key }
*/
router.post('/email-auth', (req, res) => {
  const { auth_key } = req.body;
  // 이메일 인증
  User.Student.authenticateEmail(auth_key)
    .then(() => res.json({ success: true }))
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