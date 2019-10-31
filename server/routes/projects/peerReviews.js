const router = require('express').Router();
const { isAuthenticated, isProjectMember, isProjectManager } = require('../../middlewares/auth');
const { doesProjectExist } = require('../../middlewares/project');

const Project = require('../../models/projects/project');

// index
router.get('/', (req, res) => { res.send('project peer review router'); });

/*
  동료평가 불러오기
  POST /project/peer-review/get-peer-review-by-target
	project_id, target_user_num
*/
router.post('/get-peer-review-by-target', isAuthenticated, doesProjectExist('project_id'), isProjectManager, (req, res) => {
	console.log('[POST] project/peer-review/get-peer-review-by-target');
	const { project_id, target_user_num } = req.body;

	Project.PeerReview.findByProjectIdAndTargetUserNum(project_id, target_user_num)
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
  동료평가 제출
  POST /project/peer-review/submit-peer-reviews
	JWT teamMember(hadn't reviewed) / project_id, reviewer_user_num, target_user_num, position{p1,p2,p3,p4,p5,p6,p7,p8,p9,p10}
*/
router.post('/submit-peer-reviews', isAuthenticated, doesProjectExist('project_id'), isProjectMember, (req, res) => {
	console.log('[POST] project/peer-review/submit-peer-reviews');
	const token = req.decodedToken;
	const { project_id, peerReviews } = req.body;
		
	// 과거에 동료평가를 이미 했었는지 확인
	Project.PeerReview.DidReviewerReviewed(project_id, token.user_num)
		.then(did => {
			if(did){
				res.status(403).json({ success: false, message: "이미 평가하셨습니다." });
				return;
			}

			for(var i = 0; i < peerReviews.length; i++){
				let peerReview = peerReviews[i];
				let { target_user_num,	position } = peerReview;

				Project.PeerReview.create(project_id, token.user_num, target_user_num, position)
					.then(doc => doc.save())
					.catch(err => {console.log(err)});
			}
			
			return Project.Member.findOneByProjectIdAndUserNum(project_id, token.user_num);
		}).then(member_doc => {
			//member_doc.did_review_peer = true;
			return member_doc.save();
		}).then(() => {
			return Project.Member.findByProjectId(project_id);
		}).then(member_docs => {
			let is_all_reviewed = true; // 모두 동료평가 했는지 여부
			
			for(var doc of member_docs) {
				if(doc.user_num != token.user_num && !doc.did_review_peer) {
					is_all_reviewed = false;
					break;
				}
			}

			// 모두 동료평가를 했으면, project 상태를 evaluating(평가중)으로 바꾼다.
			if(is_all_reviewed) {
				return Project.findOneById(project_id)
					.then(project_doc => {
						project_doc.setProjectState("evaluating").then();
						project_doc.save();
					})
			}
		}).then(() => {
			res.json({ success: true });
		}).catch(err => {
			res.status(403).json({ success: false, message: err.message });
			console.log(err);
		})
})

module.exports = router;