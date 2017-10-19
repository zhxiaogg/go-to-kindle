const puppeteer = require('puppeteer');
const fs = require('fs');
const mail = require('./mail.js');
const config = require('config');

const CODE_PATH = process.env['FC_FUNC_CODE_PATH'];

const {outputs, executablePath, server} = config;

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

  const output_pdf = `${outputs}${requestId}.pdf`;

  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: get_headless_executable()
  }).then(browser => {
    return open_page(browser, url).then((page) => {
      return try_extract_article(page).then(article => {
        if(article && article.content) {
          // print pretty page
          return page.close().then(() => {
            return create_pdf_using_readability(browser, article, output_pdf)
          }).then((pdf_buffer) => {return {path: output_pdf, name: to_file_name(article.title) || requestId};});
        } else {
          // print current page
          return create_pdf(page, output_pdf).then((pdf_buffer) => {return {path: output_pdf, name: requestId};});
        }
      });
    }).catch(e => {
      console.log(`error: ${e}`);
      return browser.close().then(() => {throw e;});
    }).then((output_info) => {
      console.log(output_info);
      console.log('close brwoser.');
      return browser.close().then(() => output_info);
    });
  });
};

function to_file_name(title) {
  return `${title}.pdf`;
}


function try_extract_article(page) {
  return Promise.all([
    page.addScriptTag({path: `${CODE_PATH}readability/Readability.js`}),
    page.addScriptTag({path: `${CODE_PATH}readability/prettify.js`})
  ]).then(() => {
    return page.evaluate(() => prettify())
  });
}

function create_pdf(page, pdf, pdf_options) {
  let options = {path: pdf, printBackground: false};
  if(pdf_options) {
    Object.assign(options, pdf_options);
  }
  return page.emulateMedia('print').then(() => page.pdf(options));
}

function open_page(browser, url) {
  return browser.newPage().then(page => {
    return page.goto(url).then(response => {
      if(response.ok) {
        return page;
      } else {
        throw new Error(`response status: ${response.status}`);
      }
    });
  })
}

function create_pdf_using_readability(browser, article, pdf) {
  const url = `${server}readability/pretty.html`;
  return open_page(browser, url).then(page => {
    return page.evaluate((article) => prettify(article), article).then(() => {
      return create_pdf(page, pdf, {margin: {top: 90, bottom: 90, left: 90, right: 90}});
    });
  });
}

function get_headless_executable() {
  let exec = executablePath;
  if(!exec) {
    exec = `${CODE_PATH}node_modules/headless-chrome/headless_shell`;
  }
  console.log(`executablePath: ${exec}`);
  return exec;
}
