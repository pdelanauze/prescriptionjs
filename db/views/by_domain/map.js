function(doc) {
  if (doc.collection == 'prescriptions'){
    emit(doc.domain, {
      path: doc.path,
      script: doc.script
    });
  }
}
