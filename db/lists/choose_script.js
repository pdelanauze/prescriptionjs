function (head, req) {

  var row;
  var url = req.query.url;
  var urlPath = null;
  var match = url.match(/https?:\/\/[^\/]+(\/.*)$/);
  if (match) {
    urlPath = match[1];
  }

  var pieces = [];

  // Start by adding the datgui script
  pieces.push(this.js['dat.gui']); // The dat.gui script itself

  // Now prepare the data

  var prescriptions = [];
  while (row = getRow()) {
    prescriptions.push({
      id: row._id,
      name: row.doc.name,
      domain: row.doc.domain,
      script: row.doc.script
    });
  }

  // Now set the prescriptions in a variable accessible from the init function
  pieces.push(this.js['datgui_init']); // The dat.gui script initialization function

  pieces.push('initDatGui(' + JSON.stringify(prescriptions) + ');');

  return pieces.join('\n');

}