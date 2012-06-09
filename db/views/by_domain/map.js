function(doc) {
  if (doc.type == 'prescription'){
    emit(doc.domain, {
      path: doc.path,
      script: doc.script
    });
  }
}
