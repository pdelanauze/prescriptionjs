var initDatGui = function (prescriptions) {
  var gui = new dat.GUI();

  var addItem = function (addTo, p) {
    try {
      p.script = new Function(p.script);
    } catch (e) {
      p.name = '<del>' + p.name + '</del>(Script parse error)';
      p.script = function () {
        console.log('Unable to load script! Check for syntax errors:', e);
      }
    }

    addTo.add(p, 'script').name(p.name);
  }

  // Group by folders when the same domain
  var byDomain = {};
  for (var i = 0 , ii = prescriptions.length; i < ii; i++) {
    var p = prescriptions[i];
    if (p.domain && p.domain.trim().length > 0) {
      if (!byDomain[p.domain]) {
        byDomain[p.domain] = [];
      }
      byDomain[p.domain].push(p);
      delete prescriptions[i];
    }
  }

  // Add the non-domained prescriptions
  for (var i = 0 , ii = prescriptions.length; i < ii; i++) {
    var p = prescriptions[i];
    if (p){ // Must make this check since we might have nullified the value before if it was categorized
      addItem(gui, p);
    }
  }

  // Now add the prescriptions related to a domain
  for (var key in byDomain) {
    // Create a folder for the item
    var folder = gui.addFolder(key);
    for (var j = 0 , jj = byDomain[key].length; j < jj; j++) {
      addItem(folder, byDomain[key][j]);
    }
  }

  // Simple CSS fix to make sure its on top!
  gui.domElement.parentElement.style.zIndex = 100009;

};
