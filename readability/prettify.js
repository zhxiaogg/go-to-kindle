function prettify(url) {
  const promise = new Promise((resolve, reject) => {
    var loc = document.location;
    var uri = {
      spec: loc.href,
      host: loc.host,
      prePath: loc.protocol + "//" + loc.host,
      scheme: loc.protocol.substr(0, loc.protocol.indexOf(":")),
      pathBase: loc.protocol + "//" + loc.host + loc.pathname.substr(0, loc.pathname.lastIndexOf("/") + 1)
    };
    const article = new Readability(uri, document.cloneNode(true), {debug: false}).parse();
    resolve(article);
  });
  return promise;
}
