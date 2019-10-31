/* ENV */
require('dotenv').config();

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    // 사업단 email로 보낼시 이메일에 대한 SMTP정보가 필요함
    // 환경변수를 활용하면 좋을듯.
    service:'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// var mailOption = {
//     from: 'sender@example.com',
//     to: 'receiver@example.com',
//     subject: '',
//     text: 'dd'
// };

exports.sendMail = mailOption => {
    transporter.sendMail(mailOption, (err, info) => {
        if(err) {
            console.error('[Send Mail Error] : ', err);
        }else {
            console.log('Message Send : ', info);
        }
    })
};