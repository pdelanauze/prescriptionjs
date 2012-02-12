function (head, req) {

  var row;
  var scripts = '';
  var url = req.query.url;
  var urlPath = null;
  var match = url.match(/https?:\/\/[^\/]+(\/.*)$/);
  if (match) {
    urlPath = match[1];
  }

  while (row = getRow()) {

    var script = row.value.script;
    var path = row.value.path;
    if (path && path[0] != '/') {
      path = '/' + path;
    }
    if (!path || (urlPath && urlPath.indexOf(path) == 0)) {
      scripts += script + '\n';
    }

  }

  return scripts;

}