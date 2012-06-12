function(doc){
  if (doc.type === 'replication'){
    emit(doc.id, doc.script);
  }
}