const Project = require('../models/projects/project');
const { getValueByKey } = require('../utils/utils');

// Get if the project exists
exports.doesProjectExist = function(project_id_key) {
	return (req, res, next) => {
		let project_id = getValueByKey(req.body, project_id_key);

		Project.findOneById(project_id)
			.then(project => {
				if(!project) {
					return res.status(403).json({ success: false, message: '해당 프로젝트가 없습니다.' });
				}

				req.project = project;
				next();
			})
			.catch(err => res.status(403).json({ success: false, message: err.message }));
	}
}

// # Notice : You must call doesProjectExist() before call this. (because of req.project)
// Project state validation
exports.isProjectStates = function(project_states) {
	return (req, res, next) => {
		const project = req.project;

		if(project_states.includes(project.project_state.description)) {
			next();
		}else{
			return res.status(403).json({ success: false, message: '유효하지 않은 프로젝트 상태' });
		}
	}
}