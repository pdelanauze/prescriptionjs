require.config({
  paths:{
    'jquery':'lib/jquery.min',
    'underscore':'lib/underscore',
    'backbone':'lib/backbone',
    'backbone.marionette': 'lib/backbone.marionette',
    'modelbinder': 'lib/Backbone.ModelBinder',
    'less': 'lib/less-1.3.0',
    'bootstrap': 'lib/bootstrap'
  }
});

require([
  'jquery',
  'less',
  'bootstrap',
  'lib/jquery.couch',
  'lib/sha1',
  'lib/plugins',
  'underscore',
  'backbone',
  'lib/backbone.couchdb',
  'modelbinder',
  'application/application'
], function ($, less, boostrap, jQueryCouch, sha1, plugins, _, Backbone, backboneCouchDb, BackboneModelBinder, application) {

	// Global configuration

  // TODO You need to configure these to point to the right database / couch application
  backboneCouchDb.couch.options.database = 'prescriptionjs';
  backboneCouchDb.couch.options.design = 'prescriptionjs';

  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%-([\s\S]+?)%>/g,
    escape      : /<%=([\s\S]+?)%>/g
  };

	// Start the main application
	application.start();

	// Start the backbone history
  $(function(){
    Backbone.history.start();
  });
});