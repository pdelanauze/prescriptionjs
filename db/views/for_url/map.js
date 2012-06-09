function(doc) {
  if (doc.type === 'prescription'){
    emit(doc.domain + doc.path, doc.script);
  }
}
