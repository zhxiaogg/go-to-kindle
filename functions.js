const puppeteer = require('puppeteer');

process.env.LD_LIBRARY_PATH = process.env['FC_FUNC_CODE_PATH'] + 'node_modules/nss/lib/' +  ':' + process.env.LD_LIBRARY_PATH;
process.env.PATH = process.env['FC_FUNC_CODE_PATH'] + 'node_modules/nss/bin/' + ':' + process.env.PATH;

module.exports.print_image = function(event, context, callback) {
  const {url, mail} = JSON.parse(event.toString());
  console.log("code path: ", process.env['FC_FUNC_CODE_PATH']);
  console.log("ld path:", process.env['LD_LIBRARY_PATH']);
  puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: process.env['FC_FUNC_CODE_PATH'] + 'node_modules/headless-chrome/headless_shell'
  }).then(browser => {
    return browser.newPage().then(page => {
      return page.goto(url).then(() => {
        return page.screenshot({path: '/tmp/asdf.png'});
      });
    }).then(() => {
      return browser.close();
    }).then(() => {
      callback(null, "ok");
    }).catch(e => {
      console.log(e);
      callback(new Error(e), "failed");
    });
  });
};
