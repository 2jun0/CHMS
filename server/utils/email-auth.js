/* ENV */
require('dotenv').config();

const { sendMail } = require('../lib/mailer');

// 이메일 인증시 메일로 보낼 html
var createEmailAuthHtml = (user_name, auth_key) => {
    template = `
    <a style="width: 140px; height: 30px;" href="${process.env.WEB_PAGE_URL}" rel="noreferrer noopener" target="_blank">
      <img src="${process.env.WEB_PAGE_URL}/assets/img/sw-cbnu-logo.png" width: 140px height: 30px alt="소프트웨어 사업단 로고">
    </a>
    <p>${user_name}님, 아래의 링크를 통해 이메일 인증을 완료해주세요.</p>
    <p>
      <a href="${process.env.WEB_PAGE_URL}/auth/notify-email-finished;user-name=${user_name};auth-key=${auth_key}">${process.env.WEB_PAGE_URL}/auth/notify-email-finished;user-name=${user_name};auth-key=${auth_key}</a>
    </p>`;

  return template;
};

exports.sendAuthEmail = (user_email, user_name, auth_key) => {
    html = createEmailAuthHtml(user_name, auth_key);

    // TODO :: 변경 필요
    sendMail({from: '나는 사업단이다. <soo28819test@gmail.com>', to: user_email, subject: 'CHMS 이메일 인증', html: html});
};

var createNewPasswordHtml = (user_name, new_password) => {
  template = `
  <a style="width: 140px; height: 30px;" href="${process.env.WEB_PAGE_URL}" rel="noreferrer noopener" target="_blank">
    <img src="${process.env.WEB_PAGE_URL}/assets/img/sw-cbnu-logo.png" width: 140px height: 30px alt="소프트웨어 사업단 로고">
  </a>
  <p>${user_name}님, 새로 변경한 비밀번호는 다음과 같습니다.</p>
  <p>
    ${new_password}
  </p>`;

return template;
};

exports.sendNewPasswordEmail = (user_email, user_name, new_password) => {
  html = createNewPasswordHtml(user_name, new_password);

  // TODO :: 변경 필요
  sendMail({from: '나는 사업단이다. <soo28819test@gmail.com>', to: user_email, subject: 'CHMS 비밀번호 변경 안내', html: html});
}