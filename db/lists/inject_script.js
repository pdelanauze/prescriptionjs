function(head, req){

  var row;
  var scripts = '';

  while(row = getRow()){

    var script = row.value.script;

    scripts += script + '\n';

  }

  return scripts;

}