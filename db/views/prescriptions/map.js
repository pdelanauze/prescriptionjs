function(doc) {
  if (doc.collection == 'prescriptions'){
    emit(doc.updatedAt, doc);
  }
}
