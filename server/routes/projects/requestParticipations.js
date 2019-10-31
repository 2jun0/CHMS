const router = require('express').Router();
const { isAuthenticated, verifyUserTypes, isProjectLeader } = require('../../middlewares/auth');
const { doesProjectExist } = require('../../middlewares/project');

const Project = require('../../models/projects/project');

// index
router.get('/', (req, res) => { res.send('request participation router'); });

/*
  프로젝트 참여요청
  POST /project/request-part/request-part
  requestPart { user_num, project_id, reason }
*/
router.post('/request-part', isAuthenticated, verifyUserTypes(['student']), (req, res) => {
  console.log('[POST] project/request-part/request-part');
  const requestPart = req.body.requestParticipation;

  const { user_num, project_id, reason } = requestPart;

  // Create request participation doc
  Project.RequestPart.create(user_num, project_id, reason)
    .then(doc => {
      // save
      return doc.save();
    }).then(() => {
      res.send({ success: true })
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
})

/*
  프로젝트 참여요청 가져오기 (하나)
  POST /project/request-part/get-request-part
  user_num, project_id
*/
router.post('/get-request-part', isAuthenticated, (req, res) => {
  console.log('[POST] project/request-part/get-request-part');
  const token = req.decodedToken;
  const { user_num, project_id } = req.body;

  if(token.user_num != user_num) throw Error('토큰이 유효하지 않습니다.');

  Project.RequestPart.findOneByUserNumAndProjectId(user_num, project_id)
    .then(doc => {
      // Convert to a obj
      if(doc) { return doc.toCustomObject(); }
      else { return doc;}
    }).then(obj => {
      res.send(obj); 
    })
});

/*
  프로젝트 참여요청 가져오기 (여러개)
  POST /project/request-part/get-request-parts
  JWT student(leader), admin token / project_id
*/
router.post('/get-request-parts', isAuthenticated, doesProjectExist('project_id'), isProjectLeader, (req, res) => {
  console.log('[POST] project/request-part/get-request-parts');
  const token = req.decodedToken;
  const { project_id } = req.body;

  Project.RequestPart.findByProjectId(project_id)
    .then(docs => {
      // Convert to a obj array
      let objs = [];

      for (var doc of docs) {
        objs.push(doc.toCustomObject());
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
  참여요청 삭제(거절)
  POST /project/request-part/delete-request-part
  JWT token / requestPart_id
*/
router.post('/delete-request-part', isAuthenticated, (req, res) => {
  console.log('[POST] project/request-part/delete-request-part');
  const token = req.decodedToken;
  const { requestPart_id } = req.body;

  // Delete request participation
  Project.RequestPart.deleteOneById(requestPart_id)
    .then(() => {
      res.json({ success: true });
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    })
});

/*
  참여요청 수락
  POST /project/request-part/accept-request-part
  JWT token / requestPart_id
*/
router.post('/accept-request-part', isAuthenticated, (req, res) => {
  console.log('[POST] project/request-part/accept-request-part');
  const token = req.decodedToken;
  const { requestPart_id } = req.body;

  // Accept request participation
  Project.RequestPart.acceptOneById(requestPart_id)
    .then(() => {
      return Project.RequestPart.findOneById(requestPart_id);
    }).then(requestPart_doc => { 
      return Project.Member.create(requestPart_doc.user_num, requestPart_doc.project_id, false);
    }).then(doc => {
      return doc.save();
    }).then(() => {
      res.json({ success: true });
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    })
});

module.exports = router;