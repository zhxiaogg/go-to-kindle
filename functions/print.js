const puppeteer = require('puppeteer');
const fs = require('fs');
const mail = require('./mail.js');
const config = require('config');

const CODE_PATH = process.env['FC_FUNC_CODE_PATH'];

const {outputs, executablePath} = config;

fs.mkdir(outputs, (err) => {});

// set library load path to resolve libnss3.so
process.env.LD_LIBRARY_PATH =  `${CODE_PATH}node_modules/nss/lib/`;

/**
 *
 * @param options - options for print function
 * @param options.url - url to print
 * @return promise - output pdf file path if print succeded
 *
 **/
module.exports.print = function({url, requestId}) {
  console.log(`print pdf for: ${url}`);

  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: get_headless()
  }).then(browser => {
    return create_pdf(browser, url, requestId);
  });
};

/**
 * this function tries to create a pdf, and close the browser at last.
 **/
function create_pdf(browser, url, requestId) {
  const path = `${outputs}/${requestId}.pdf`;

  return browser.newPage().then(page => {
    return page.goto(url)
      .then((response) => {
        if(response.ok) {
          return page.pdf({path: path,printBackground: false});
        } else {
          throw new Error(`response status: ${response.status}`);
        }
      })
  }).then((buffer) => {
    console.log(`printing succeeded: ${path}`);
    browser.close();
    return path;
  }).catch((e) => {
    console.log(`printing failed: ${e}`);
    browser.close();
    throw e;
  });
}

function get_headless() {
  let exec = executablePath;
  if(!exec) {
    exec = `${CODE_PATH}node_modules/headless-chrome/headless_shell`;
  }
  console.log(`executablePath: ${exec}`);
  return exec;
}
