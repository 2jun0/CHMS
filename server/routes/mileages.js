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
  JWT Token student, admin / formData { mileage_id, file_description }
*/
router.post('/upload-file', isAuthenticated, verifyUserTypes(['student','admin']), (req, res) => {
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
  내 마일리지 얻기
  POST /mileage/get-my-mileages
  JWT Token student / _dataIndex{start, count}, _filter?
*/
router.post('/get-my-mileages', isAuthenticated, verifyUserTypes(['student']), (req, res) => {
  console.log('[POST] /mileage/get-my-mileages');
  const token = req.decodedToken;

  let { _dataIndex, _filter } = req.body;
  _filter['user_num'] = token.user_num;
  
  getFilterOfMileage(_filter).then(filter => {
    Mileage.findWithFilter(filter, _dataIndex)
      .then(docs => {
        let objs = [];

        for(var doc of docs) {
          objs.push(doc.toCustomObject());
        }

        return res.send(objs);
      }).catch(err => {
        res.status(403).json({ success: false, message: err.message });
        console.log(err);
      });
  })
});

/*
  내 마일리지 개수 구하기
  POST /mileage/get-my-mileage-count
  JWT Token student / _filter
*/
router.post('/get-my-mileage-count', isAuthenticated, verifyUserTypes(['student']), (req, res) => {
  console.log('[POST] /mileage/get-my-mileage-count');
  const token = req.decodedToken;

  const { _filter } = req.body;
  _filter['user_num'] = token.user_num;

  getFilterOfMileage(_filter).then(filter => {
    Mileage.findCountWithFilter(filter)
      .then(count => {
        return res.send(count+'');
      }).catch(err => {
        res.status(403).json({ success: false, message: err.message });
        console.log(err);
      });
  });
});

/*
  마일리지 얻기
  POST /mileage/get-mileages
  JWT Token admin / _dataIndex{start, count}, _filter
*/
router.post('/get-mileages', isAuthenticated, verifyUserTypes(['admin']), (req, res) => {
  console.log('[POST] /mileage/get-mileages');

  const { _dataIndex, _filter } = req.body;

  getFilterOfMileage(_filter).then(filter => {
    Mileage.findWithFilter(_dataIndex, filter)
      .then(docs => {
        let objs = [];

        for(var doc of docs) {
          objs.push(doc.toCustomObject());
        }

        return res.send(objs);
      }).catch(err => {
        res.status(403).json({ success: false, message: err.message });
        console.log(err);
      });
  });
});

/*
  마일리지 개수 구하기
  POST /mileage/get-mileage-count
  JWT Token admin / _filter
*/
router.post('/get-mileage-count', isAuthenticated, verifyUserTypes(['admin']), (req, res) => {
  console.log('[POST] /mileage/get-mileage-count');

  const { _filter } = req.body;

  getFilterOfMileage(_filter).then(filter => {
    Mileage.findCountWithFilter(filter)
      .then(count => {
        return res.send(count+'');
      }).catch(err => {
        res.status(403).json({ success: false, message: err.message });
        console.log(err);
      });
  });
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

async function getFilterOfMileage(_filter) {
  let filter;

  if(!_filter) {
    filter = {};
    return filter;
  }else{
    filter = _filter;
  }

  if(filter.code) {
    await MileageCode.findOneByCode({'$regex': filter.code}).then(code => {
      filter.code = code;
    }).catch(err => {
      console.log(err);
    });
  }

  return filter;
}


module.exports = router;