const { body, oneOf } = require('express-validator');
const { checks } = require('./validator.js');

const STR_NOT_ALLOW_ACCESS = '비정상적인 접근입니다.';

// You must call doesUserExist() before call exports
exports.checkUserUpdate = function(inputs_key) {
	return async (req, res, next) => {
		const token = req.decodedToken;

		let checkArray;
		switch(req.user.user_type.description) {
			case 'admin':
				break;
			case 'student':
				checkArray = exports.checkStudentUser(inputs_key, undefined, (token.user_type=='admin')?true:false);
				break;
			case 'professor':
				checkArray = exports.checkProfessorUser(inputs_key, undefined, (token.user_type=='admin')?true:false);
				break;
			case 'mento':
				checkArray = exports.checkMentoUser(inputs_key, undefined, (token.user_type=='admin')?true:false);
				break;
		}

		for(let check of checkArray) {
			if(typeof(check) == 'function'){
				await check(req, res, ()=>{});
			}else{
				await check.run(req);
			}
		}

		next();
	}
}

function getCheckUserBase(inputs_key, user_type, isCreateMode = false, isAdmin=false) {
	let check;
	
	if(isCreateMode) {
		check = [
			body(inputs_key+'.user_num').exists().not().isEmpty().withMessage('사용자 번호를 입력해주세요.')
				.isInt().withMessage("사용자 번호는 정수여야 합니다."),
			body(inputs_key+'.password').exists().not().isEmpty().withMessage('비밀번호를 입력해주세요.')
				.isLength({ min:6, max:16 }).withMessage('비밀번호는 영문또는 숫자로 입력해야 합니다.')
				.matches(/[a-zA-Z0-9!@#$%^&*]+/).withMessage('비밀번호는 최소 6자, 최대16자로 입력해야 합니다.')
				.custom((value, { req }) => value === req.body[inputs_key].repeat_password).withMessage('비밀번호가 일치하지 않습니다.'),
		];
	}else{
		check = [
			body(inputs_key+'.user_num').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
			body(inputs_key+'.password').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
		];
	}

	check = check.concat([
		body(inputs_key+'.name').exists().not().isEmpty().withMessage('이름을 입력해주세요')
			.matches(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/).withMessage('이름은 한글이나 알파벳의 조합으로 이루어져야 합니다.'),
		body(inputs_key+'.join_date').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
		body(inputs_key+'.user_type').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
		body(inputs_key+'.auth_key').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
		body(inputs_key+'.new_email').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
	]);

	if(!isAdmin) {
		check = check.concat([
			body(inputs_key+'.auth_state').not().exists().withMessage(STR_NOT_ALLOW_ACCESS)
		])
	}

	return check;
}

exports.checkStudentUser = function(inputs_key, isCreateMode=false, isAdmin=false, showError = true) {
	let checkArray = getCheckUserBase(inputs_key, 'student', isCreateMode, isAdmin).concat([
		body(inputs_key+'.email').exists().not().isEmpty().withMessage('이메일을 입력해주세요')
			.isEmail().trim().withMessage('이메일 형식이 잘못되었습니다.'),
		body(inputs_key+'.github_id').exists().not().isEmpty().withMessage('깃허브 아이디를 입력해주세요')
			.isString().trim().withMessage('깃허브 아이디 형식이 잘못되었습니다.'),
		body(inputs_key+'.year_of_study').exists().not().isEmpty().withMessage('학년을 입력해주세요')
			.isInt({ min: 1, max: 4 }).withMessage('학년은 1과 4사이의 정수여야 합니다.'),
		body(inputs_key+'.major_type').exists().not().isEmpty().withMessage('학과를 입력해주세요'),
		body(inputs_key+'.department_type').exists().not().isEmpty().withMessage('소속학과를 입력해주세요')
	]);

	if(showError) { return checks(checkArray); }
	else{ return checkArray; }
}

exports.checkProfessorUser = function(inputs_key, isCreateMode=false, isAdmin=false, showError = true) {
	let checkArray = getCheckUserBase(inputs_key, 'professor', isCreateMode, isAdmin).concat([
		body(inputs_key+'.email').exists().not().isEmpty().withMessage('이메일을 입력해주세요')
			.isEmail().withMessage('이메일 형식이 잘못되었습니다.'),
		body(inputs_key+'.major').exists().not().isEmpty().withMessage('연구분야를 입력해주세요')
			.isString().isLength({ min:1, max: 20}).withMessage('연구분야는 최소 1, 최대 20자 글자여야 합니다.'),
		body(inputs_key+'.department_type').exists().not().isEmpty().withMessage('소속학과를 입력해주세요')
	]);

	if(showError) { return checks(checkArray); }
	else{ return checkArray; }
}

exports.checkMentoUser = function(inputs_key, isCreateMode=false, isAdmin=false, showError = true) {
	let checkArray = getCheckUserBase(inputs_key, 'mento', isCreateMode, isAdmin).concat([
		body(inputs_key+'.email').exists().not().isEmpty().withMessage('이메일을 입력해주세요')
			.isEmail().withMessage('이메일 형식이 잘못되었습니다.'),
		body(inputs_key+'.workplace').exists().not().isEmpty().withMessage('직장을 입력해주세요')
			.isString().isLength({ min:0, max: 20 }).withMessage("직장은 최소 0, 최대 20자 글자여야 합니다."),
		body(inputs_key+'.department').exists().not().isEmpty().withMessage('부서를 입력해주세요')
			.isString().isLength({ min:0, max: 20 }).withMessage("부서는 최소 0, 최대 20자 글자여야 합니다."),
		body(inputs_key+'.job_position').exists().not().isEmpty().withMessage('직급을 입력해주세요')
			.isString().isLength({ min:0, max: 20 }).withMessage("직급은 최소 0, 최대 20자 글자여야 합니다."),
	]);

	if(showError) { return checks(checkArray); }
	else{ return checkArray; }
}