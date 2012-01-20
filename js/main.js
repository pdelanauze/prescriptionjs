require.config({
  paths:{
    'jquery':'application/jquery.min',
    'underscore':'application/underscore',
    'backbone':'application/backbone',
    'backbone.marionette': 'application/backbone.marionette',
    'modelbinding': 'application/backbone.modelbinding'
  }
});

require([
  'jquery',
  'application/jquery.couch',
  'application/sha1',
  'application/plugins',
  'underscore',
  'backbone',
  'application/backbone-couchdb',
  'modelbinding',
  'application/prescription-app'
], function ($, jQueryCouch, sha1, plugins, _, Backbone, backboneCouchDb, ModelBinding, Prescription) {

  console.log(arguments);

  // TODO You need to configure these to point to the right database / couch application
  Backbone.couch_connector.config.db_name = 'prescriptionjs';
  Backbone.couch_connector.config.ddoc_name = 'prescriptionjs';
  Backbone.couch_connector.config.view_name = 'by_type';
  Backbone.couch_connector.config.global_changes = true;

  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%-([\s\S]+?)%>/g,
    escape      : /<%=([\s\S]+?)%>/g
  };

  $(function(){

    // Prep the application
    var prescriptions = new Prescription.Collections.PrescriptionCollection();
    var prescriptionsTable = new Prescription.Views.PrescriptionTableControlView({
      collection: prescriptions,
      el: $('#prescriptions-list-container')
    });

    prescriptionsTable.render();
    prescriptions.fetch();

  });

});