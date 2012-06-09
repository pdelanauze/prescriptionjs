function(doc) {
  if (doc.type == 'prescription'){
    emit(doc.updatedAt, null);
  }
}
