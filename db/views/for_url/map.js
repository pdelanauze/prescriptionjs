function(doc) {
  emit(doc.domain + doc.path, doc.script);
}
