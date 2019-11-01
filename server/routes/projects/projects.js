const express = require('express');
const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const fs = require('fs');
// middlewares
const { isAuthenticated, isProjectManager, isProjectLeader, forceByAdmin } = require('../../middlewares/auth');
const { doesProjectExist, isProjectStates } = require('../../middlewares/project');
const { checks, checkProjectUpdate, checkProjectInputs, checkOutputs, checkEvaluation } = require('../../middlewares/validator/project');
// models
const Codetype = require('../../models/codetype');
const User = require('../../models/users/user');
const Project = require('../../models/projects/project');
const ProjectMember = require('../../models/projects/member');
// utils
const { uploadFileInProject } = require('../../utils/files');
const { createFilter, addCodetypeToFilter } = require('../../utils/query/filter');

// index
router.get('/', (req, res) => { return res.send('project router'); });

// ROUTERS
router.use('/request-part', require('./requestParticipations'));
router.use('/member', require('./members'));
router.use('/peer-review', require('./peerReviews'));

/*
  프로젝트 추가
  POST /project/add-project
  토큰만 있으면 가능
*/
router.post('/add-project', isAuthenticated, checkProjectInputs('project'), (req, res, next) => {
  const token = req.decodedToken;
  console.log('[POST] add-project');

  const { project } = req.body;
  if(token.year_of_study){ project.mean_member_year_of_study = token.year_of_study; }
  else { project.mean_member_year_of_study = 1; }

  Project.create(project)
    .then(project => {
      fs.mkdirSync(`../files/projects/${project._id}`, {recursive: true});

      return project.save();

    }).then(project => {
      return Project.Member.create(token.user_num, project._id, true)
      .then(member => {
        member.save();
        return project;
      });
    }).then(project => {
      return project.toCustomObject();
    }).then(obj => {
      return res.send(obj);
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
  });

/*
  프로젝트 삭제
  /project/delete-project
  JWT Token leader / project_id
*/
router.post('/delete-project', isAuthenticated, doesProjectExist('project_id'),
  forceByAdmin(isProjectLeader), (req, res, next) => {
  console.log('[POST] project/delete-project');

  Project.deleteOneById(project_id)
    .then(() => {
      return res.json({ success: true })
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  프로젝트 수정
  /project/update-project
  JWT Token leader, admin / project_id, project
*/
router.post('/update-project', isAuthenticated, doesProjectExist('project_id'), forceByAdmin(isProjectLeader),
  checkProjectUpdate('project'), (req, res, next) => {
  console.log('[POST] project/update-project');

  const { project_id, project } = req.body;

  Project.customObjectToOriginObject(project)
    .then(doc => {
      req.project.set(doc);
      return req.project.save();
    }).then(() => {
      return res.json({ success: true })
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  프로젝트 산출물 제출
  /project/submit-outputs
  JWT Token leader, admin / project_id, outputs
  submitting outputs
*/
router.post('/submit-outputs', isAuthenticated, doesProjectExist('project_id'),
  forceByAdmin(isProjectLeader), isProjectStates(['submitting outputs']), checkOutputs('outputs'), (req, res, next) => {
  console.log('[POST] project/submit-outputs');

  const project = req.project;
  const { project_id, outputs } = req.body;
  
  // set next state
  project.setProjectState('peer reviewing')
    .then(() => {
      // set outputs
      project.outputs = outputs;
      project.save();
      res.json({ success: true })
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  프로젝트 평가 제출
  /project/submit-evaluation
  JWT Token manager(멘토, 지도교수), admin / project_id, evaluation
  evaluating
*/ 
router.post('/submit-evaluation', isAuthenticated, doesProjectExist('project_id'),
  forceByAdmin(isProjectManager), isProjectStates(['evaluating']), checkEvaluation('evaluation'), (req, res, next) => {
  console.log('[POST] project/submit-evaluation');

  const project = req.project;
  const { evaluation } = req.body;

  project.evaluation = evaluation;
  project.setProjectState('finished')
    .then(() => {
      project.save();

      res.json({ success: true });
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  프로젝트 파일 다운로드
  /project/files
*/
router.use('/files', express.static('../files/projects'));

/*
  프로젝트 파일 업로드
  POST /project/upload-file
  JWT Token leader / formData { project_id, file_description }
*/
router.post('/upload-file', isAuthenticated, (req, res, next) => {
  console.log('[POST] project/upload-file');

  uploadFileInProject(req, res, (err) => {
    if(err) {
      res.status(403).json({ success : false, message : err.message });
      console.log(err);
    }

    return res.json({success : true});
  })
});

/*
  프로젝트 검색
  POST /project/get-project
  project_id
*/
router.post('/get-project', doesProjectExist('project_id'), (req, res, next) => {
  console.log('[POST] /project/get-project');
  const project = req.project;
  project.count++;
  project.save();
  let obj = project.toCustomObject();

  return res.send(obj);
})

/*
  공개 프로젝트 검색
  POST /project/get-public-project
  project_id
*/
router.post('/get-public-project', doesProjectExist('project_id'), (req, res, next) => {
  console.log('[POST] /project/get-public-project');
  const project = req.project;
  project.count++;
  project.save();
  let obj = pproject.toCustomObject();

  return res.send(obj);
})

///////////////////////////////////////////////////////////////////////

function getFilterOfPublicProject(_filter) {
  return new Promise((resolve, reject) => {
    let filter;
    if (_filter) {
      filter = createFilter({
        is_public: true,
        $or : [
          {'kr_title' : _filter.kr_title},
          {'en_title' : _filter.en_title},
          {'keywords' : _filter.keywords}
        ],
        class_contest_name : _filter.class_contest_name,
        mean_member_year_of_study: _filter.mean_member_year_of_study,
        'exec_period.start_date' : _filter['exec_period.start_date']
      })

      return addCodetypeToFilter(filter, 'project_state', _filter.project_state, Codetype.Projectstate)
        .then(() => {
          return addCodetypeToFilter(filter, 'project_area_type', _filter.project_area_type, Codetype.Projectareatype);
        }).then(() => {
          return addCodetypeToFilter(filter, 'project_type', _filter.project_type, Codetype.Projecttype);
        }).then(() => {
          resolve(filter);
        });
    }else {
      filter = { 'is_public' : true };
      resolve(filter);
    }
  })
}

/*
  공개 프로젝트 개수 검색
  POST /project/get-public-project-count
  _filter
*/
router.post('/get-public-project-count', (req, res) => {
  console.log('[POST] /project/get-public-project-count');

  const {_filter} = req.body

  getFilterOfPublicProject(_filter)
    .then(filter => {
      return Project.getCountWithFilter(filter)
    }).then(count => {
      return res.send(''+count);
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  공개 프로젝트 검색
  POST /project/get-public-projects
  _dataIndex, _filter
*/
router.post('/get-public-projects', (req, res) => {
  console.log('[POST] /project/get-public-projects');
  const {_dataIndex, _filter} = req.body;
  getFilterOfPublicProject(_filter)
    .then(filter => {
      return Project.findWithFilter(filter, _dataIndex)
    }).then(project_docs => {
      objs = [];
      for(var i = 0; i < project_docs.length; i++){
        objs.push(project_docs[i].toCustomObject());
      };
      return objs;
    }).then(objs => {
      return res.send(objs);
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

//////////////////////////////////////////////////////

function getFilterOfAllProject(_filter) {
  return new Promise((resolve, reject) => {
    let filter;
    if (_filter) {
      filter = createFilter({
        is_public: _filter.is_public,
        $or : [
          {'kr_title' : _filter.kr_title},
          {'en_title' : _filter.en_title},
          {'keywords' : _filter.keywords}
        ],
        class_contest_name : _filter.class_contest_name,
        mean_member_year_of_study: _filter.mean_member_year_of_study,
        'exec_period.start_date' : _filter['exec_period.start_date']
      })

      return addCodetypeToFilter(filter, 'project_state', _filter.project_state, Codetype.Projectstate)
        .then(() => {
          return addCodetypeToFilter(filter, 'project_area_type', _filter.project_area_type, Codetype.Projectareatype);
        }).then(() => {
          return addCodetypeToFilter(filter, 'project_type', _filter.project_type, Codetype.Projecttype);
        }).then(() => {
          resolve(filter);
        });
    }else {
      resolve(null);
    }
  })
}

/*
  모든 프로젝트 개수 검색
  POST /project/get-all-project-count
  JWT Token / _filter
*/
router.post('/get-all-project-count', isAuthenticated, (req, res) => {
  console.log('[POST] /project/get-all-project-count');
  const { _filter } = req.body;
  getFilterOfAllProject(_filter)
    .then(filter => {
      return Project.getCountWithFilter(filter)
    }).then(count => {
      return res.send(''+count)
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  모든 프로젝트 검색
  POST /project/get-all-projects
  JWT Token / _dataIndex, _filter
*/
router.post('/get-all-projects', isAuthenticated, (req, res) => {
  console.log('[POST] /project/get-all-projects');
  const { _dataIndex, _filter } = req.body;
  getFilterOfAllProject(_filter)
    .then(filter => {
      return Project.findWithFilter(filter, _dataIndex)
    }).then(project_docs => {
      objs = [];
      for(var i = 0; i < project_docs.length; i++){
        objs.push(project_docs[i].toCustomObject());
      }
      return objs
    }).then(objs => {
      return res.send(objs);
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

//////////////////////////////////////////////////////

/*
  맴버 user number로 프로젝트 개수 검색
  POST /project/get-member-project-count
  JWT Token / user_num
*/
router.post('/get-member-project-count', isAuthenticated, (req, res) => {
  console.log('[POST] /project/get-member-project-count');

  const { user_num } = req.body;
  
  Project.Member.findByUserNum(user_num)
    .then(members => {
      projectIds = [];

      for(var member of members) {
        projectIds.push(member.project_id);
      }

      return projectFilter = createFilter({
        _id: projectIds
      })
    }).then(filter => {
      return Project.getCountWithFilter(filter)
    }).then(count => {
      return res.send(''+count)
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  맴버 user number로 프로젝트 검색
  POST /project/get-member-projects
  JWT Token / user_num
*/
router.post('/get-member-projects', isAuthenticated, (req, res) => {
  console.log('[POST] /project/get-member-projects');
  const { _dataIndex, user_num } = req.body;

  Project.Member.findByUserNum(user_num)
    .then(members => {
      projectIds = [];

      for(var member of members) {
        projectIds.push(member.project_id);
      }

      return projectFilter = createFilter({
        _id: projectIds
      });
    }).then(filter => {
      return Project.findWithFilter(filter, _dataIndex)
    }).then(project_docs => {
      objs = [];
      for(var i = 0; i < project_docs.length; i++){
        objs.push(project_docs[i].toCustomObject());
      };
      return objs;
    }).then(objs => {
      return res.send(objs)
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  교수 user number로 프로젝트 개수 검색
  POST /project/get-prof-project-count
  JWT Token / user_num
*/
router.post('/get-prof-project-count', isAuthenticated, (req, res) => {
  console.log('[POST] /project/get-prof-project-count');

  const { user_num } = req.body;
  
  Project.getCountByProfUserNum(user_num)
    .then(count => {
      return res.send(''+count)
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  교수 user number로 프로젝트 검색
  POST /project/get-prof-projects
  JWT Token / user_num
*/
router.post('/get-prof-projects', isAuthenticated, (req, res) => {
  console.log('[POST] /project/get-prof-projects');
  const { _dataIndex, user_num } = req.body;

  Project.findByProfUserNum(user_num, _dataIndex)
    .then(project_docs => {
      objs = [];
      for(var i = 0; i < project_docs.length; i++){
        objs.push(project_docs[i].toCustomObject());
      };
      return objs;
    }).then(objs => {
      return res.send(objs)
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  멘토 user number로 프로젝트 개수 검색
  POST /project/get-mento-project-count
  JWT Token / user_num
*/
router.post('/get-mento-project-count', isAuthenticated, (req, res) => {
  console.log('[POST] /project/get-mento-project-count');

  const { user_num } = req.body;
  
  Project.getCountByMentoUserNum(user_num)
    .then(count => {
      return res.send(''+count)
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

/*
  멘토 user number로 프로젝트 검색
  POST /project/get-mento-projects
  JWT Token / user_num
*/
router.post('/get-mento-projects', isAuthenticated, (req, res) => {
  console.log('[POST] /project/get-mento-projects');
  const { _dataIndex, user_num } = req.body;

  Project.findByMentoUserNum(user_num, _dataIndex)
    .then(project_docs => {
      objs = [];
      for(var i = 0; i < project_docs.length; i++){
        objs.push(project_docs[i].toCustomObject());
      };
      return objs;
    }).then(objs => {
      return res.send(objs)
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

//////////////////////////////////////////////////////

/*
  프로젝트 팀장 검색
  POST /project/get-leader
  project_id
*/
router.post('/get-leader', (req, res) => {
  console.log('[POST] /public/get-leader');
  const { project_id } = req.body;

  ProjectMember.findLeaderOneByProjectId(project_id)
    .then(leaderMember => {
      if(!leaderMember) { throw Error('팀장 정보 없음'); }
      let leader_num = leaderMember.user_num;

      return User.Student.findOneByUserNum(leader_num);
    }).then(doc => {
      return doc.toCustomObject();
    }).then(obj => {
      return res.send(obj);
    }).catch(err => {
      res.status(403).json({ success: false, message: err.message });
      console.log(err);
    });
});

module.exports = router;