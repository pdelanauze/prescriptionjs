define(['backbone', 'underscore', 'lib/utility', 'lib/backbone-utility', 'lib/backbone-couch-schema-model', 'lib/backbone.couchdb', 'modelbinder'], function (Backbone, _, Utility, BackboneUtility, BackboneSchemaModel, Backbone, ModelBinder) {

  var PrescriptionApp = {
    Models:{},
    Collections:{},
    Views:{},
    Routers:{},
    Templates:{

    }
  };

  PrescriptionApp.Models.Prescription = BackboneSchemaModel.extend({
    defaults: {
      updatedAt: new Date(),
      type: 'prescription'
    },
    schema: {
      description: 'JavaScript snippet',
      type: 'prescription',
      properties: {
        name: {
          title: 'Name',
          type: 'string',
          required: true,
          'default': 'The name of your javascript snippet'
        },
        domain: {
          name: 'Domain',
          type: 'string',
          required: true,
          'default': 'The host domain ( e.g. www.google.ca )'
        },
        path: {
          name: 'Path',
          type: 'string',
          required: false,
          'default': 'The start path of the site (e.g. /products for webpages under www.google.ca/products)'
        },
        script: {
          name: 'Script',
          type: 'string',
          'default': 'The actual script to execute on the target site.',
          maxLength: 1000000
        }
      }
    }
  });

  PrescriptionApp.Collections.PrescriptionCollection = Backbone.couch.Collection.extend({
    model:PrescriptionApp.Models.Prescription,
    change_feed:true,
    couch:function () {
      return {
        view:Backbone.couch.options.design + '/by_type',
        key: 'prescription',
        include_docs:true
      }
    },
    initialize:function () {
      this._db = Backbone.couch.db(Backbone.couch.options.database);
    }
  });

  PrescriptionApp.Views.PrescriptionTableItemView = BackboneUtility.Views.TableItemView.extend({
    initialize:function (options) {
      BackboneUtility.Views.TableItemView.prototype.initialize.apply(this, arguments);
    }
  });

  PrescriptionApp.Views.PrescriptionTableView = BackboneUtility.Views.TableView.extend({
    itemView: PrescriptionApp.Views.PrescriptionTableItemView,
    initialize: function(options){
      BackboneUtility.Views.TableView.prototype.initialize.call(this, options);
    }
  });

  PrescriptionApp.Views.PrescriptionTableControlView = BackboneUtility.Views.TableControlView.extend({
    tableView: PrescriptionApp.Views.PrescriptionTableView,
    columns: [
      {name: 'Name', value: 'name', type: 'text'},
      {name: 'Domain', value: 'domain', type: 'text'},
      {name: 'Path', value: 'path', type: 'text'},
      {name: 'Last updated', value: 'updated_at', type: 'text'}
    ],
    initialize:function (options) {
      BackboneUtility.Views.TableControlView.prototype.initialize.call(this, options);
      _.bindAll(this, 'render');
    },
    render:function () {
      BackboneUtility.Views.TableControlView.prototype.render.call(this);

      var href = window.location.protocol + '//' + window.location.host +
                      '/' + Backbone.couch.options.database +
                      '/_design/' + Backbone.couch.options.design +
                      '/_list/inject_script/by_domain';

      var inlineScript = _.template('javascript:var p = function(){' +
              'var s = document.createElement("script");' +
              'var location = encodeURIComponent(window.location);' +
              'var domain = encodeURIComponent(window.location.host);' +
              's.onload = function(){};' +
              's.src = "<%- href %>" + "?url=" + location + "&limit=100&startkey=\\"" + domain + "\\"&endkey=\\"" + domain + "\u9999\\"";' +
              'document.body.appendChild(s);' +
              '}();', {
        href: href
      });

      var bookmarklet = this.$('.btn.bookmarklet');
      if (bookmarklet.length === 0){
        bookmarklet = $('<a href="#" class="btn btn-info bookmarklet">Bookmarklet</a><span> </span>');
        this.$('.control.top').prepend(bookmarklet);
      }
      bookmarklet.attr('href', inlineScript);

      return this;
    }
  });

  PrescriptionApp.Views.PrescriptionEditView = BackboneUtility.Views.ModelEditView.extend({
    events:{

    },
    initialize:function (options) {
      BackboneUtility.Views.ModelEditView.prototype.initialize.call(this, options);
    }
  });

  PrescriptionApp.Routers.PrescriptionRouter = BackboneUtility.Routers.ScaffoldViewBasedRouter.extend({
    modelName: 'prescription',
    pluralModelName: 'prescriptions',
    modelClass: PrescriptionApp.Models.Prescription,
    tableControlViewClass: PrescriptionApp.Views.PrescriptionTableControlView,
    modelEditViewClass:PrescriptionApp.Views.PrescriptionEditView,
    initialize: function(options){
      this.collection = new PrescriptionApp.Collections.PrescriptionCollection();
      BackboneUtility.Routers.ScaffoldViewBasedRouter.prototype.initialize.apply(this, arguments);

      this.route(this.pluralModelName + "/migrate", this.pluralModelName + 'MigrationFromOld', this.migratePrescriptions);
    },
    migratePrescriptions: function(){

      var container = $(_.template('<div class="alert alert-info"><button class="close" data-dismiss="alert">×</button><strong name="title">Starting migration!</strong> <span name="description">Best check yo self, you\'re not looking too good.</span></div>', {})).prependTo(this.appView.$el);

      var mc = Backbone.Model.extend({});
      var m = new mc({
        title:'Starting migration',
        description:'Waiting to start first migration'
      });
      var modelBinder = new ModelBinder();
      modelBinder.bind(m, container);

      var length = this.collection.length;
      var i = 0;
      var doIt = function (prescription) {

        m.set({
          title:'Migration #' + i++,
          description:'Migrating prescription ' + prescription.get('name')
        });

        prescription.unset('collection');
        prescription.set({type: 'prescription'});
        prescription.save();

        if (i == length) {
          // done, unbind and remove
          modelBinder.unbind();
          container.remove();
        }

      };

      this.collection.each(function(prescription){
        doIt(prescription);
      });

      // Redirect to the index
      this.navigate('/' + this.pluralModelName);
    }
  });

  return PrescriptionApp;

});