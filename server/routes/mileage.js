const router = require('express').Router();
// middlewares
const { isAuthenticated, verifyUserTypes, isSelf, forceByAdmin } = require('../middlewares/auth');
const { doesUserExist } = require('../middlewares/user');
// validators
const { checkMileageInputs } = require('../middlewares/validator/mileage');
// models
const Mileage = require('../models/mileages/mileage');

// index
router.get('/', (req, res) => {
  res.send('mileage router');
});

/* 
  마일리지 추가
  POST /mileage/add-mileage
  JWT Token student / mileage
*/
router.post('/add-mileage', isAuthenticated, verifyUserTypes(['student','admin']), doesUserExist('user_num'),
 checkMileageInputs('mileage'), forceByAdmin(isSelf), (req, res) => {
  console.log('[POST] /mileage/add-mileage');
  const { mileage } = req.body;

  Mileage.create(mileage)
    .then(doc => {
      res.send({ success: true});
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  마일리지 파일 업로드
  POST /mileage/upload-file
  JWT Token student / formData { mileage_id, file_description }
*/
router.post('/upload-file', isAuthenticated, verifyUserTypes(['student','admin']), (req, res, next) => {
  console.log('[POST] upload-file');

  uploadFileInProject(req, res, (err) => {
    if(err) {
      res.status(403).json({ success : false, message : err.message });
      console.log(err);
    }

    return res.json({success : true});
  })
});

module.exports = router;