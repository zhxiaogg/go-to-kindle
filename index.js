if(process.env['NODE_ENV'] === 'dev') {
  process.env['FC_FUNC_CODE_PATH'] = process.cwd();
} else if(process.env['FC_FUNC_CODE_PATH'] && !process.env['NODE_ENV']) {
  process.env['NODE_ENV'] = 'prod';
}

const config = require('config');
const {send:_send} = require('./functions/mail.js');
const {print:_print} = require('./functions/print.js');

exports.print = function(event, context, callback) {
  const {mail, url} = JSON.parse(event.toString());
  const {requestId} = context;

  _print({url: url, requestId: requestId})
    .then(pdf => _send({mail: mail, pdf: pdf}))
    .then(() => callback(null, 'ok'))
    .catch(e => callback(e, null));
};
