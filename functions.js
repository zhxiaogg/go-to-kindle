const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const fs = require('fs');

let mailer = nodemailer.createTransport({
  host: 'smtpdm.aliyun.com',
  port: 25,
  secureConnection: true,
  auth: {
     user: 'noreply@send.gotokindle.com',
     pass: 'Send2017Kindle'
  }
});

const CODE_PATH = process.env['FC_FUNC_CODE_PATH'];

fs.mkdir(`/tmp/pdfs`, (err) => {
  if(err) {
    console.log(err);
  }
});

// set library load path to resolve libnss3.so
process.env.LD_LIBRARY_PATH =  `${CODE_PATH}node_modules/nss/lib/`;

module.exports.send = function(event, context, callback) {
  const {url, mail} = JSON.parse(event.toString());
  const {requestId} = context;

  const pdf_path = `/tmp/pdfs/${requestId}.pdf`;

  const options = {
    path: pdf_path,
    mail: mail,
    url: url,
    requestId: requestId
  }

  puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // executablePath: `${CODE_PATH}node_modules/headless-chrome/headless_shell`
    executablePath: '/Users/zhxiaog/Downloads/chrome-mac/Chromium.app/Contents/MacOS/Chromium'
  }).then(browser => {
    return print(browser, options).then(() => {
      browser.close();
    });
  }).then(() => {
    callback(null, "ok");
  }).catch(e => {
      console.log(e);
      callback(new Error(e), "failed");
  });
};

function print(browser, {url, mail, path, requestId}) {
  const promise = browser.newPage().then(page => {
    return page.goto(url).then(() => {
      page.pdf({
        path: path,
        printBackground: false,
      })
    }).then(() => {
      // send pdf to mail
      const mailOptions = {
          from: 'gotokindle<noreply@send.gotokindle.com>',
          to: mail, // list of receivers
          subject: 'your sendtokindle service',
          text: 'Best Regards!',
          // html: '<b>Hello world</b><img src="cid:01" style="width:200px;height:auto">', // html body
          attachments: [
              {
                  filename: `${requestId}.pdf`,
                  path: path
              }
          ],
      };

      const result = new Promise((resolve, reject) => {
        mailer.sendMail(mailOptions, (error, info) => {
          if(error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
      return result;
    })
  });
  return promise;
}
