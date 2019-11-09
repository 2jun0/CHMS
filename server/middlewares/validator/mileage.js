const { body, oneOf } = require('express-validator');
const { checks } = require('./validator.js');

const STR_NOT_ALLOW_ACCESS = '비정상적인 접근입니다.'; 

function getCheckMileageBase(inputs_key) {
    let checkArray;

    checkArray = [
        body(inputs_key+'.user_num').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
        body(inputs_key+'.user_name').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
        body(inputs_key+'.department').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
        body(inputs_key+'.input_date').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
        body(inputs_key+'.code').exists().withMessage('마일리지 코드값을 입력해주세요!')
            .isString().withMessage('마일리지를 선택해 주세요!'),
        // body(inputs_key+'.score').exists().withMessage('마일리지 점수를 입력해주세요')
        //     .isInt().withMessage('마일리지 점수는 정수여야 합니다.'),
        body(inputs_key+'.act_date').exists().withMessage('발생일자를 입력해주세요'),
        body(inputs_key+'.act_date.from').exists().withMessage('발생시작일자를 입력해야 합니다.')
            .custom((value, { req }) => {
                if (isNaN(Date.parse(value))) { return false; }
                else{
                    req.body[inputs_key].act_date.from = new Date(value);
                    return true;
            }}).withMessage('참여(발생) 시작일을 입력해주세요!'),//.withMessage('발생시작일자의 입력형식이 잘못되었습니다.'),
        body(inputs_key+'.act_date.to').exists().withMessage('발생종료일자를 입력해야 합니다.')
            .custom((value, { req }) => {
                if (isNaN(Date.parse(value))) { return false; }
                else{
                    req.body[inputs_key].act_date.to = new Date(value);
                    return true;
            }}).withMessage('참여(발생) 종료일을 입력해주세요!')//.withMessage('발생종료일자의 입력형식이 잘못되었습니다.')
            .custom((value, { req }) => (req.body[inputs_key].act_date.from.getTime() <= req.body[inputs_key].act_date.to.getTime())).withMessage('발생종료일자는 발생시작일자보다 같거나 늦어야합니다.'),
        body(inputs_key+'.detail').exists().withMessage('활동상세내역을 입력해주세요!')
            .isString().trim().isLength({ min: 1, max: 100 }).withMessage('활동상세내역은 은 최소 1, 최대 100글자여야 합니다.'),
        body(inputs_key+'.info_photos').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
        body(inputs_key+'.accept_date').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
        body(inputs_key+'.score').not().exists().withMessage(STR_NOT_ALLOW_ACCESS),
    ];

    return checkArray;
}


exports.checkMileageInputs = function(inputs_key, showError = true) {
    let checkArray = getCheckMileageBase(inputs_key, showError).concat([
        body(inputs_key+'.is_accepted').not().exists().withMessage(STR_NOT_ALLOW_ACCESS)
    ])
    
    if(showError) { return checks(checkArray); }
	else{ return checkArray; }
}

exports.checkMileageUpdate = function(inputs_key, showError = true) {
    return async (req, res, next) => {
        const token = req.decodedToken;

        let checkArray = getCheckMileageBase(inputs_key, showError);

        if(token.user_type == 'admin') {
            checkArray.concat([
                oneOf([
                    body(inputs_key+'.is_accepted').not().exists(),
                    body(inputs_key+'.is_accepted').exists().isBoolean().withMessage('사업단 확인은 Boolean형이여야 합니다.')
                ])
            ])
        }else{
            checkArray.concat([
                body(inputs_key+'.is_accepted').not().exists().withMessage(STR_NOT_ALLOW_ACCESS)
            ])
        }

        if(showError) { checkArray = checks(checkArray); }

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