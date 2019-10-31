const router = require('express').Router();
const { isAuthenticated } = require('../../middlewares/auth');

const Project = require('../../models/projects/project');
// index
router.get('/', (req, res) => { res.send('project member router'); });

/*
  멤버 불러오기
  POST /project/member/get-member
	project_id
*/
router.post('/get-member', (req, res) => {
	console.log('[POST] project/member/get-member');
	const { project_id, user_num } = req.body;

	// Get members by project id
	Project.Member.findOneByProjectIdAndUserNum(project_id, user_num)
		.then(doc => {
			if(!doc) return null;
			return doc.toCustomObject();
		}).then(obj => {
			res.send(obj);
		}).catch(err => {
			res.status(403).json({ success: false, message: err.message });
			console.log(err);
		})
});

/*
  멤버 불러오기
  POST /project/member/get-members
	project_id
*/
router.post('/get-members', (req, res) => {
	console.log('[POST] project/member/get-members');
	const { project_id } = req.body;

	// Get members by project id
	Project.Member.findByProjectId(project_id)
		.then(docs => {
			let objs = [];
			for(var doc of docs) {
				objs.push(doc.toCustomObject());
			}
			return objs;
		}).then(objs => {
			res.send(objs);
		}).catch(err => {
			res.status(403).json({ success: false, message: err.message });
			console.log(err);
		})
});

/*
  멤버 업데이트
  POST /project/member/update-member
	JWT userself, leader / member_id, member
*/
router.post('/update-member', isAuthenticated, (req, res) => {
	const token = req.decodedToken;

	console.log('[POST] project/member/update-member');
	const { member_id, member } = req.body;

	// check authority
	Project.Member.findOneById(member_id)
		.then(member_doc => {
			Project.Member.customObjectToOriginObject(member)
				.then(doc => {
					member_doc.set(doc);
					return member_doc.save();
				}).catch(err => { throw err;});
		}).then(() => {
			res.json({ success: true})
		}).catch(err => {
			res.status(403).json({ success: false, message: err.message });
			console.log(err);
		})
})

module.exports = router;