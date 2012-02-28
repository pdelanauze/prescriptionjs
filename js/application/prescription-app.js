define(['backbone', 'underscore', 'modelbinding', 'application/utility', 'application/backbone-utility'], function (Backbone, _, ModelBinding, Utility, BackboneUtility) {

  var PrescriptionApp = {
    Models:{},
    Collections:{},
    Views:{},
    Routers:{},
    Templates:{

    }
  };

  PrescriptionApp.Models.Prescription = Backbone.Model.extend({
    url:'/prescriptions',
    defaults: {
      updatedAt: new Date(),
      name: '',
      domain: '',
      path: '',
      script: ''
    },
    validate:function (attributes) {
      var errors = {};
      var isValid = true;

      // It's persisted, so it's valid ...
      _.each(attributes, function (v, k) {
        switch (k) {
          case 'name':
            if (!v || v.length < 5) {
              errors['name'] = 'should be at least 5 characters';
              isValid = false;
            }
            break;
          case 'domain':
            if (!v || v.length < 5) {
              errors['domain'] = 'should be a valid domain name (i.e. google.ca)';
              isValid = false;
            }
            break;
        }
      });

      if (!isValid) {
        return errors;
      }
    }
  });

  PrescriptionApp.Collections.PrescriptionCollection = Backbone.Collection.extend({
    model:PrescriptionApp.Models.Prescription,
    url:'/prescriptions'
  });

  PrescriptionApp.Views.PrescriptionTableItemView = BackboneUtility.Views.TableItemView.extend({
    initialize:function (options) {
      BackboneUtility.Views.TableItemView.prototype.initialize.call(this, options);
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
    modelName: 'prescription',
    pluralModelName: 'prescriptions',
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
                      '/' + Backbone.couch_connector.config.db_name +
                      '/_design/' + Backbone.couch_connector.config.ddoc_name +
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
    handleFileAttachments:false,
    events:{

    },
    initialize:function (options) {

      this.formStructure = {
        action:'#/prescriptions/new',
        method:'POST',
        recordId:this.model.get('id'),
        legend: 'Script editor',
        idPrefix:'prescription',
        fields:[
          {
            name:'id',
            humanName:'Id',
            outerClass:'',
            inputOuterClass:'',
            inputClass: 'input-xlarge',
            value:this.model.get('id'),
            type:'hidden'
          },
          {
            name:'name',
            humanName:'Name',
            inputClass: 'input-xlarge',
            value:this.model.get('name'),
            type:'text'
          },
          {
            name:'domain',
            humanName:'Domain',
            inputClass: 'input-xlarge',
            value:this.model.get('domain'),
            type:'text'
          },
          {
            name:'path',
            humanName:'Path',
            inputClass: 'input-xlarge',
            value:this.model.get('path'),
            type:'text'
          },
          {
            name:'script',
            humanName:'Script',
            value:this.model.get('script'),
            type:'textarea',
            inputClass:'input-xxlarge',
            rows:'7'
          }
        ],
        buttons:[
          {'class':'btn-primary', type:'submit', humanName:'Submit'},
          {type:'reset', humanName:'Reset'},
          {type:'button', humanName:'Cancel', 'class':'cancel'}
        ]
      };

      BackboneUtility.Views.ModelEditView.prototype.initialize.call(this, options);
    }
  });

  PrescriptionApp.Routers.PrescriptionRouter = BackboneUtility.Routers.RESTishRouter.extend({
    modelName: 'prescription',
    pluralModelName: 'prescriptions',
    modelClass: PrescriptionApp.Models.Prescription,
    tableControlView: PrescriptionApp.Views.PrescriptionTableControlView,
    modelEditView:PrescriptionApp.Views.PrescriptionEditView,
    initialize: function(options){
      this.collection = new PrescriptionApp.Collections.PrescriptionCollection();
      BackboneUtility.Routers.RESTishRouter.prototype.initialize.call(this, options);
    }
  });

  return PrescriptionApp;

});