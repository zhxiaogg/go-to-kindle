const nodemailer = require('nodemailer');
const config = require('config');

const {host, user, password} = config.get('mail');

const mailer = nodemailer.createTransport({
  host: host,
  port: 25,
  secureConnection: true,
  auth: {
     user: user,
     pass: password
  }
});

/**
 *
 * send a pdf file to a mailbox
 *
 * @param options - mail options
 * @param options.mail - send mail address
 * @param options.pdf - pdf file path
 * @return promise
 *
 **/
module.exports.send = function({mail, pdf}) {
  const options = {
      from: `gotokindle<${user}>`,
      to: mail,
      subject: 'your sendtokindle service',
      text: 'Best Regards!',
      // html: '',
      attachments: [
          {
              filename: pdf,
              path: pdf
          }
      ],
  };

  const result = new Promise((resolve, reject) => {
    mailer.sendMail(options, (error, info) => {
      if(error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
  return result;
}
