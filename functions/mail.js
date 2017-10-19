const nodemailer = require('nodemailer');
const config = require('config');

const {host, port, secure, user, password} = config.get('mail');

const mailer = nodemailer.createTransport({
  host: host,
  port: port,
  secureConnection: secure,
  auth: {
     user: user,
     pass: password
  },
  connectionTimeout: 50000,
  greetingTimeout: 50000,
  debug: false,
  logger: true
},{
  from: `gotokindle<${user}>`
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
module.exports.send = function({mail, pdf, name}) {
  console.log(`sending ${name} to: ${mail}`);
  const options = {
      to: mail,
      subject: name,
      text: 'Best Regards!',
      attachments: [
        {
          filename: name,
          path: pdf
        }
      ],
  };

  const result = new Promise((resolve, reject) => {
    mailer.sendMail(options, (error, info) => {
      if(error) {
        console.log(`sending mail failed: ${error}`);
        reject(error);
      } else {
        console.log('sending succeeded');
        resolve(info);
      }
    });
  });
  return result;
}
