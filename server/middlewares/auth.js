const { verifyToken } = require('../lib/token');

const User = require('../models/users/user');
const Project = require('../models/projects/project');
const { getValueByKey } = require('../utils/utils');

exports.isAuthenticated = (req, res, next) => {
  // 토큰 취득
  const token = req.body.token || req.query.token || req.headers.authorization;
  // const token = req.body.token || req.query.token || req.headers.authorization.split(' ')[1];
  // 토큰 미존재: 로그인하지 않은 사용자
  if (!token) {
    return res.status(403).json({ success: false, message: '토큰이 존재하지 않습니다.' });
  }

  // 토큰 검증
  verifyToken(token)
    .then(decodedToken => {
      req.decodedToken = decodedToken;
      if (!req.decodedToken) {
        return res.status(403).send({ success: false, message: '토큰이 없습니다.' });
      }else if(!req.decodedToken.__isAuthToken){
        return res.status(403).send({ success: false, message: '유효한 토큰이 아닙니다.' });
      }

      next();
    })
    .catch(err => res.status(403).json({ success: false, message: err.message }));
};

exports.isAuthenticatedButNotError = (req, res, next) => {
  // 토큰 취득
  const token = req.body.token || req.query.token || req.headers.authorization;
  // const token = req.body.token || req.query.token || req.headers.authorization.split(' ')[1];
  // 토큰 미존재: 로그인하지 않은 사용자
  if (!token) {
    req.decodedToken = {user_type: 'external'}
    next();
    return;
  }

  // 토큰 검증
  verifyToken(token)
    .then(decodedToken => {
      req.decodedToken = decodedToken;
      if (!req.decodedToken) {
        req.decodedToken = {user_type: 'external'}
      }else if(!req.decodedToken.__isAuthToken){
        return res.status(403).send({ success: false, message: '유효한 토큰이 아닙니다.' });
      }

      next();
    })
    .catch(err => res.status(403).json({ success: false, message: err.message }));
};

exports.verifyUserTypes = function (user_types) {
  return (req, res, next) => {
    const token = req.decodedToken;

    User.findOneById(token.id)
      .then(user => {
        if(!user_types.includes(user.user_type.description)) {
          return res.status(403).json({ success: false, message: '유효하지 않은 토큰입니다.'});
        }

        next();
      })
      .catch(err => res.status(403).json({ success: false, message: err.message }));
  }
};

exports.forceByAdmin = function (middlewares) {
  return (req, res, next) => {
    let i = 0;
    let middleware_next = function(){
      i++;
      if(i < middlewares.length) {
        middlewares[i];
      }else{
        next();
      }
    }

    const token = req.decodedToken;
  
    if(token.user_type == 'admin') {
      next();
    }else{
      if(Array.isArray(middlewares)) {
        middleware_next(req, res, middleware_next);
      }else{
        middlewares(req,res,next);
      }
    }
  };
}

// Get if the client is the project member
exports.isProjectMember = function (project_id_key) {
  return (req, res, next) => {
    const token = req.decodedToken;
    let project_id = getValueByKey(req.body,project_id_key);

    Project.Member.findByProjectId(project_id)
      .then(members => {
        let isProjectMember = false;
        for(var member of members) {
          if(member.user_num == token.user_num) {
            isProjectMember = true;
            break;
          }
        }

        if(!isProjectMember) {
          return res.status(403).json({ success: false, message: '권한이 없습니다.'});
        }

        next();
      })
      .catch(err => res.status(403).json({ success: false, message: err.message }));
  };
}

// # Notice : You must call doesProjectExist() before call this. (because of req.project)
// Get if the client is the project manager (지도교수, 멘토)
exports.isProjectManager = (req, res, next) => {
  const token = req.decodedToken;
  const project = req.project;

  // 지도 교수거나 멘토이면 ok
  if(project.prof_num == token.user_num || project.mento_num == token.user_num) {
    next();
  }else{
    return res.status(403).json({ success: false, message: '권한이 없습니다.'});
  }
}

// # Notice : You must call doesProjectExist() before call this. (because of req.project)
// Get if the client is the project leader
exports.isProjectLeader = (req, res, next) => {
  const token = req.decodedToken;
  const project = req.project;

  Project.Member.findLeaderOneByProjectId(project.id)
    .then(leader => {
      if(leader.user_num !== token.user_num) {
        return res.status(403).json({ success: false, message: '권한이 없습니다.'});
      }

      req.leader = leader;
      next();
    })
    .catch(err => res.status(403).json({ success: false, message: err.message }));
}

// # Notice : You must call doesUserExist() before call this. (because of req.user)
// Get if the client is the user
exports.isSelf = (req, res, next) => {
  const token = req.decodedToken;
  const user = req.user;

  if(token.user_num !== user.user_num) {
    res.status(403).json({ success: false, message: "유효하지 않은 토큰" });
  }

  next();
};