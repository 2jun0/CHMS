const { body, oneOf, validationResult } = require('express-validator');

const STR_NOT_ALLOW_ACCESS = '비정상적인 접근입니다.';

exports.checks = function(validations, errMsg) {
	return validations.concat((req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			let err = errors.errors[0].nestedErrors ? errors.errors[0].nestedErrors[0] : errors.errors[0];
			console.log(err);
			return res.status(422).json({ success: false, message: (errMsg ? errMsg : err.msg)});
		}

		next();
	})
}

// You must call doesProjectExist() before call exports
exports.checkProjectUpdate = function(inputs_key) {
	return async (req, res, next) => {
		let containOutputs = false;
		let containEvaluation = false;

		switch(req.project.project_state.description){
			case "ready":
			case "recruiting":
			case "executing":
			case "submitting outputs":
				break;
			case "peer reviewing":
				containOutputs = true;
				break;
			case "evaluating":
				containOutputs = true;
				break;
			case "finished":
				containOutputs = true;
				containEvaluation = true;
				break;
		}

		let checks = exports.checkProjectInputs(inputs_key, containOutputs, containEvaluation);

		for(let check of checks) {
			if(typeof(check) == 'function'){
				await check(req, res, ()=>{});
			}else{
				await check.run(req);
			}
		}

		next();
	};
}

exports.checkProjectInputs = function(inputs_key, containOutputs, containEvaluation, showError = true) {
	let checks = [
		body(inputs_key+'.kr_title').exists().withMessage('한글 제목을 입력해야 합니다.')
    	.isString().trim().isLength({ min:1, max:100 }).withMessage('한글 제목은 최소 1, 최대 100글자여야 합니다.'),
  	body(inputs_key+'.en_title').exists().withMessage('영어 제목을 입력해야 합니다.')
			.isString().trim().isLength({ min:1, max:100 }).withMessage('영어 제목은 최소 1, 최대 100글자여야 합니다.'),
			
  	body(inputs_key+'.keywords').exists().withMessage('키워드를 입력해야 합니다.')
			.isArray({min: 1, max: 5}).withMessage('키워드 수는 최소 1개 최대 5개 입니다.'),
			
  	body(inputs_key+'.member_count').exists().withMessage('팀원 수를 입력해야 합니다.')
    	.isNumeric().withMessage('팀원 수는 숫자여야 합니다.')
			.custom((value, { req }) => value > 0).withMessage('팀원 수는 본인 포함 1명 이상이여야 합니다.'),

		oneOf([
			body(inputs_key+'.prof_num').not().exists(),
			body(inputs_key+'.prof_num').isIn([null, undefined]),
			body(inputs_key+'.prof_num').exists().isInt().withMessage('지도교수번호는 숫자여야 합니다.')
		]),
		oneOf([
			body(inputs_key+'.mento_num').not().exists(),
			body(inputs_key+'.mento_num').isIn([null, undefined]),
			body(inputs_key+'.mento_num').exists().isInt().withMessage('멘토번호 는 숫자여야합니다.')
		]),

		body(inputs_key+'.project_type').exists().withMessage('프로젝트 구분을 입력해야 합니다.')
			.isString().trim().isIn(["class", "contest", "others"]).withMessage("프로젝트 구분이 유효하지 않습니다."),
		oneOf([
			body(inputs_key+'.project_type').not().isIn(['class', 'contest']),
			body(inputs_key+'.class_contest_name').exists().withMessage('교과목 이름이나 공모전 이름을 입력해주세요')
				.isString().trim().isLength({ min: 1, max: 50 }).withMessage('교과목 이름이나 공모전 이름은 최소 1, 최대 100 글자여야 합니다')
		]),

		body(inputs_key+'.project_area_type').exists().withMessage('프로젝트 영역을 입력해야 합니다.')
			.isString().trim().isIn(["health", "creativity", "life", "safety", "entertainment"]).withMessage('프로젝트 영역이 유효하지 않습니다.'),

  	body(inputs_key+'.recruit_period').exists().withMessage('프로젝트 모집기간을 입력해야 합니다.'),
  	body(inputs_key+'.recruit_period.start_date').exists().withMessage('모집시작 기간을 입력해야 합니다.')
    .custom((value, { req }) => {
        if (isNaN(Date.parse(value))) { return false; }
        else{
          req.body.project.recruit_period.start_date = new Date(value);
          return true;
        }
    }).withMessage('모집 시작 날짜의 입력형식이 잘못되었습니다.'),
		body(inputs_key+'.recruit_period.end_date').exists().withMessage('모집 종료 날짜를 입력해야 합니다.')
			.custom((value, { req }) => {
				if (isNaN(Date.parse(value))) { return false; }
				else{
					req.body.project.recruit_period.end_date = new Date(value);
					return true;
				}
			}).withMessage('모집 종료 날짜의 입력형식이 잘못되었습니다.')
			.custom((value, { req }) => (req.body.project.recruit_period.start_date.getTime() <= req.body.project.recruit_period.end_date.getTime())).withMessage('모집 종료 날짜는 모집 시작 날짜보다 같거나 늦어야합니다.'),
			
		body(inputs_key+'.exec_period').exists().withMessage('프로젝트 수행기간을 입력해야 합니다.'),
		body(inputs_key+'.exec_period.start_date').exists().withMessage('수행 시작 날짜를 입력해야 합니다.')
			.custom((value, { req }) => {
				if (isNaN(Date.parse(value))) { return false; }
				else{
					req.body.project.exec_period.start_date = new Date(value);
					return true;
				}
			}).withMessage('수행 시작 날짜의 입력형식이 잘못되었습니다.')
			.custom((value, { req }) => (req.body.project.recruit_period.end_date.getTime() <= req.body.project.exec_period.start_date.getTime())).withMessage('수행 시작 날짜는 모집 종료 날짜보다 같거나 늦어야합니다.'),
		body(inputs_key+'.exec_period.end_date').exists().withMessage('수행 종료 날짜를 입력해야 합니다.')
			.custom((value, { req }) => {
				if (isNaN(Date.parse(value))) { return false; }
				else{
					req.body.project.exec_period.end_date = new Date(value);
					return true;
				}
			}).withMessage('수행 종료 날짜의 입력형식이 잘못되었습니다.')
			.custom((value, { req }) => (req.body.project.exec_period.start_date.getTime() <= req.body.project.exec_period.end_date.getTime())).withMessage('수행 종료 날짜는 수행 시작 날짜보다 같거나 늦어야합니다.'),
			
		// intro
		body(inputs_key+'.intro.kr_description').exists().withMessage('한글 프로젝트 주요 내용 소개를 입력해야 합니다.')
			.isString().trim().isLength({ min:1, max:500 }).withMessage('한글 프로젝트 주요 내용소개는 최소 1, 최대 500글자여야 합니다.'),
		body(inputs_key+'.intro.en_description').exists().withMessage('영어 프로젝트 주요 내용 소개를 입력해야 합니다.')
			.isString().trim().isLength({ min:1, max:500 }).withMessage('영어 프로젝트 주요 내용소개는 최소 1, 최대 500글자여야 합니다.'),
		body(inputs_key+'.intro.expected_effect').exists().withMessage('프로젝트 기대효과 및 활용분야를 입력해야 합니다.')
			.isString().trim().isLength({ min:1, max:500 }).withMessage('프로젝트 기대효과 및 활용분야는 최소 1, 최대 500글자여야 합니다.'),
		body(inputs_key+'.intro.develop_env').exists().withMessage('프로젝트 개발환경을 입력해야 합니다.')
			.isString().trim().isLength({ min:1, max:30 }).withMessage('프로젝트 개발환경은 최소 1, 최대 30글자여야 합니다.'),
		body(inputs_key+'.intro.necessity').exists().withMessage('프로젝트 개발 배경 및 필요성을 입력해야 합니다.')
			.isString().trim().isLength({ min:1, max:500 }).withMessage('프로젝트 개발 배경 및 필요성은 최소 1, 최대 500글자여야 합니다.'),
		body(inputs_key+'.intro.functions').exists().withMessage('프로젝트 주요기능 소개를 입력해야 합니다.')
			.isString().trim().isLength({ min:1, max:500 }).withMessage('프로젝트 주요기능 소개는 최소 1, 최대 500글자여야 합니다.'),
		body(inputs_key+'.intro.languages').exists().withMessage('사용언어를 입력해야 합니다.')
			.isArray({min: 0, max: 5}).withMessage('프로젝트 사용언어는 최소 0개 최대 5개여야만 합니다.'),
		body(inputs_key+'.intro.opensources').exists().withMessage('프로젝트 활용 오픈소스 소프트웨어를 입력해야 합니다.')
			.isArray({min: 0, max: 20}).withMessage('프로젝트 활용 오픈소스 소프트웨어는 최소 0개최대 20개여야만 합니다.'),
	];

	checks.concat(exports.checkOutputs(inputs_key+'.outputs', containOutputs, false));
	checks.concat(exports.checkEvaluation(inputs_key+'.evaluation', containEvaluation, false));

	if(showError) { return exports.checks(checks); }
	else{ return checks; }
};

exports.checkOutputs = function(outputs_key, isAllowed = true, showError = true) {
	let checks;

	if(isAllowed) {
		checks = [
			oneOf([
				body(outputs_key+'.github_url').not().exists(),
				body(outputs_key+'.github_url').exists().isURL().withMessage('깃허브 URL형식이 잘못되었습니다.')
			]),
			body(outputs_key+'.doc_ppt_file').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
			body(outputs_key+'.doc_zip_file').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
			oneOf([
				body(outputs_key+'.url_ucc').not().exists(),
				body(outputs_key+'.url_ucc').exists().isURL().withMessage('UCC URL형식이 잘못되었습니다.')
			]),
		];
	}else{
		checks = [
			body(outputs_key).not().exists().withMessage(STR_NOT_ALLOW_ACCESS)
		];
	}

	if(showError) { return exports.checks(checks); }
	else{ return checks; }
};

exports.checkEvaluation = function(evaluation_key, isAllowed = true, showError = true) {
	let checks;

	if(isAllowed) {
		checks = [
			body(evaluation_key+'.summary_score').exists().withMessage('모두 입력한 뒤, 제출해주세요')
				.isInt({min: 1, max: 5}).withMessage('평가 점수는 최소 1, 최대 5인 정수여야 합니다.'),
			body(evaluation_key+'.contents_score').exists().withMessage('모두 입력한 뒤, 제출해주세요')
				.isInt({min: 1, max: 5}).withMessage('평가 점수는 최소 1, 최대 5인 정수여야 합니다.'),
			body(evaluation_key+'.exec_contents_score').exists().withMessage('모두 입력한 뒤, 제출해주세요')
				.isInt({min: 1, max: 5}).withMessage('평가 점수는 최소 1, 최대 5인 정수여야 합니다.'),
			body(evaluation_key+'.predicted_effect_score').exists().withMessage('모두 입력한 뒤, 제출해주세요')
				.isInt({min: 1, max: 5}).withMessage('평가 점수는 최소 1, 최대 5인 정수여야 합니다.'),
			body(evaluation_key+'.application_field_score').exists().withMessage('모두 입력한 뒤, 제출해주세요')
				.isInt({min: 1, max: 5}).withMessage('평가 점수는 최소 1, 최대 5인 정수여야 합니다.'),
			body(evaluation_key+'.outputs_score').exists().withMessage('모두 입력한 뒤, 제출해주세요')
				.isInt({min: 1, max: 5}).withMessage('평가 점수는 최소 1, 최대 5인 정수여야 합니다.'),
			body(evaluation_key+'.opensource_score').exists().withMessage('모두 입력한 뒤, 제출해주세요')
				.isInt({min: 1, max: 5}).withMessage('평가 점수는 최소 1, 최대 5인 정수여야 합니다.'),
		];
	}else{
		checks = [
			body(evaluation_key).not().exists().withMessage(STR_NOT_ALLOW_ACCESS)
		]
	}

	if(showError) { return exports.checks(checks); }
	else{ return checks; }
};

///////////////////////////////////////////////////////////////////////

exports.checkUserInputs = function(inputs_key, showError = true) {
	checks = [
		body(inputs_key+'.user_num').exists().withMessage('사용자 번호를 입력해주세요.')
			.isInt(),
		body(inputs_key+'.user_type').exists().withMessage('사용자 종류를 입력해주세요.')
			.isIn(['admin','student','mento','professor']),
		body(inputs_key+'.password').exists().withMessage('비밀번호를 입력해주세요.')
			.isLength({ min:6, max:16 }).withMessage('비밀번호는 영문또는 숫자로 입력해야 합니다.')
			.matches(/[a-zA-Z0-9!@#$%^&*]+/).withMessage('비밀번호는 최소 6자, 최대16자로 입력해야 합니다.'),
		body(inputs_key+'.name').exists().withMessage('이름을 입력해주세요')
			.matches(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/).withMessage('이름은 한글이나 알파벳의 조합으로 이루어져야 합니다.'),
		body(inputs_key+'.join_date').not().exists().withMessage('가입일은 입력하거나 수정할 수 없습니다.')
			.isString()
	];
}