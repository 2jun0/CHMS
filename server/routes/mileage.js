const router = require('express').Router();
// middlewares
const { isAuthenticated, verifyUserTypes, isSelf, forceByAdmin } = require('../middlewares/auth');
const { doesUserExist } = require('../middlewares/user');
// validators
const { checkMileageInputs } = require('../middlewares/validator/mileage');
// models
const Mileage = require('../models/mileages/mileage');
const MileageCode = require('../models/mileages/mileageCode');
const MajorMileage = require('../models/mileages/majorMileage');
const MinorMileage = require('../models/mileages/minorMileage');

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
  console.log('[POST] /mileage/upload-file');

  uploadFilesInMileage(req, res, (err) => {
    if(err) {
      res.status(403).json({ success : false, message : err.message });
      console.log(err);
    }

    return res.json({success : true});
  })
});

/*
  마일리지 코드 다운로드
  GET /mileage/get-mileage-codes
  nothing
*/
router.get('/get-mileage-codes', (req, res) => {
  console.log('[GET] /mileage/get-mileage-codes');

  MileageCode.findAllCodes()
    .then((doc_codes) => {
      let objs = [];

      for(var doc of doc_codes) {
        objs.push(doc.toCustomObject());
      }

      return res.send(objs);
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  마일리지 메이저 코드 다운로드
  GET /mileage/get-major-mileages
  nothing
*/
router.get('/get-major-mileages', (req, res) => {
  console.log('[GET] /mileage/get-major-mileages');

  MajorMileage.findAllCodes()
    .then((doc_codes) => {
      let objs = [];

      for(var doc of doc_codes) {
        objs.push(doc.toCustomObject());
      }

      return res.send(objs);
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  마일리지 마이너 코드 다운로드
  GET /mileage/get-minor-mileages
  nothing
*/
router.get('/get-minor-mileages', (req, res) => {
  console.log('[GET] /mileage/get-minor-mileages');

  MinorMileage.findAllCodes()
    .then((doc_codes) => {
      let objs = [];

      for(var doc of doc_codes) {
        objs.push(doc.toCustomObject());
      }

      return res.send(objs);
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});


module.exports = router;