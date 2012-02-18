define(['backbone', 'underscore', 'modelbinding', 'application/utility'], function (Backbone, _, ModelBinding, Utility) {

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
    initialize:function () {
      if (!this.get('updatedAt')) {
        this.set({updatedAt:new Date()});
      }
      if (!this.get('name')) {
        this.set({name:''});
      }
      if (!this.get('domain')) {
        this.set({domain:''});
      }
      if (!this.get('path')) {
        this.set({path:''});
      }
      if (!this.get('script')) {
        this.set({script:''});
      }
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

  PrescriptionApp.Views.PrescriptionTableItemView = Backbone.View.extend({
    className:'prescription-table-item-view',
    tagName:'tr',
    template:_.template('<td class="id" data-bind="id"></td>' +
            '<td class="name" data-bind="text name"></td>' +
            '<td class="domain" data-bind="text domain"></td> ' +
            '<td class="path" data-bind="text path"></td> ' +
            '<td class="updated-at" data-bind="text updatedAt"></td>' +
            '<td class="table-cell-actions">' +
            '<a class="btn btn-small btn-primary edit" href="#/prescriptions/edit">Edit</a>' +
            '<form action="#/prescriptions" method="DELETE"><button type="submit" class="btn btn-small btn-danger delete">Delete</button></form> ' +
            '</td> '),
    events:{
      'submit form[method="DELETE"]':'doDelete'
    },
    initialize:function () {
      _.bindAll(this, 'render', 'doDelete');
      this.model.bind('remove', this.remove);
      $(this.el).html(this.template(this.model.toJSON()));
      this.render();
      ModelBinding.bind(this);
    },
    render:function () {
      this.$('a.edit').attr('href', '#/prescriptions/' + this.model.get('_id') + '/edit');
      this.$('.btn.delete').closest('form').attr('action', '#/prescriptions/' + this.model.get('_id'));
      return this;
    },
    doDelete:function () {
      if (confirm('Are you sure ?')) {
        this.model.destroy();
        this.close();
      }
      return false;
    },
    close:function () {
      this.remove();
      this.unbind();
      ModelBinding.unbind(this);
    }
  });

  PrescriptionApp.Views.PrescriptionTableView = Backbone.View.extend({
    className:'table table-striped vertical-middle prescription-table-view',
    tagName:'table',
    events:{

    },
    initialize:function (options) {
      _.bindAll(this, 'render', 'itemAdded');
      this.collection.bind('add', this.itemAdded);
      this.collection.bind('reset', this.render);

      // Pre-render
      var columns = [
        {name:'ID', value:'id'},
        {name:'Name', value:'name'},
        {name:'Domain', value:'domain'},
        {name:'Path', value:'path'},
        {name:'Last updated', value:'updatedAt'},
        {name:'', value:''}
      ];

      $(this.el).html(Utility.Templates.renderTableStructure({
        columns:columns
      }));

    },
    render:function () {
      var tbody = this.$('tbody:first').empty();
      this.collection.each(this.itemAdded);
      return this;
    },
    itemAdded:function (model) {
      var itemView = new PrescriptionApp.Views.PrescriptionTableItemView({
        model:model
      }).render();
      this.$('tbody:first').prepend(itemView.el);
    }
  });

  PrescriptionApp.Views.PrescriptionTableControlView = Backbone.View.extend({
    className:'prescription-table-control-view',
    tableView:null,
    template:'<div class="pull-right control top">' +
            '<a href="#" class="btn btn-info bookmarklet">Bookmarklet</a>&nbsp;' +
            '<a href="#/prescriptions/new" class="btn btn-primary">New prescription</a>' +
            '</div>' +
            '<div class="table-container"></div>',
    initialize:function (options) {
      _.bindAll(this, 'render');
      this.tableView = new PrescriptionApp.Views.PrescriptionTableView({
        collection:options.collection
      });

    },
    render:function () {
      this.tableView.render();
      $(this.el).empty().html(_.template(this.template)).find('.table-container:first').append(this.tableView.el);

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

      this.$('.btn.bookmarklet').attr('href', inlineScript);

      return this;
    }
  });

  PrescriptionApp.Views.PrescriptionEditView = Backbone.View.extend({
    className:'prescription-edit-view',
    events:{
      'submit form':'doSave',
      'reset form':'doReset',
      'click .btn.cancel':'doCancel'
    },
    initialize:function () {
      _.bindAll(this, 'render', 'doSave', 'doReset', 'doCancel', 'close', 'updateValidations', 'hasChanged');
      this.model.bind('remove', this.close);
      this.model.bind('error', this.updateValidations);
      this.model.bind('change', this.hasChanged);

      var data = this.model.toJSON();
      if (this.model.isNew()) {
        data.id = 'new';
      }

      var formStructure = {
        action:'#/prescriptions/new',
        method:'POST',
        recordId:this.model.get('id'),
        legend: 'Script editor',
        fields:[
          {
            idPrefix:'prescription',
            name:'id',
            humanName:'Id',
            outerClass:'',
            inputOuterClass:'',
            inputClass: 'input-xlarge',
            value:this.model.get('id'),
            type:'hidden'
          },
          {
            idPrefix:'prescription',
            name:'name',
            humanName:'Name',
            inputClass: 'input-xlarge',
            value:this.model.get('name'),
            type:'text'
          },
          {
            idPrefix:'prescription',
            name:'domain',
            humanName:'Domain',
            inputClass: 'input-xlarge',
            value:this.model.get('domain'),
            type:'text'
          },
          {
            idPrefix:'prescription',
            name:'path',
            humanName:'Path',
            inputClass: 'input-xlarge',
            value:this.model.get('path'),
            type:'text'
          },
          {
            idPrefix:'prescription',
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

      $(this.el).html(Utility.Templates.renderForm(formStructure));

      ModelBinding.bind(this);
    },
    render:function () {
      return this;
    },
    hasChanged:function () {
      return this.updateValidations(this.model, this.model.validate());
    },
    updateValidations:function (model, errors) {
      var ctx = this;
      ctx.$('.control-group.error,:input.error').removeClass('error').
              find('.help-inline').text('');

      _.each(errors, function (v, k) {
        ctx.$(':input[name="' + k + '"]').addClass('error').
                closest('.control-group').addClass('error').
                find('.help-inline').text(v);

      });
    },
    doSave:function () {
      var ctx = this;
      try {
        this.model.save(null, {
          success:function () {
            ctx.close();
            window.location.href = '#/prescriptions';
          }
        });
      } catch (e) {
        console.log('error', e);
      }

      return false;
    },
    doReset:function () {
      if (!this.model.hasChanged() || confirm('Prescription has unsaved changes, discard?')) {
        return true;
      } else {
        return false;
      }
    },
    doCancel:function () {
      if (!this.model.hasChanged() || confirm('Prescription has unsaved changes, discard?')) {
        this.close();
        window.location.href = '#/prescriptions';
      }
    },
    close:function () {
      this.remove();
      this.unbind();
      ModelBinding.unbind(this);
    }
  });


  PrescriptionApp.Routers.PrescriptionRouter = Backbone.Router.extend({

    possibleStateClasses:[
      'list-prescriptions-state',
      'edit-prescription-state',
      'new-prescription-state',
    ],

    newPrescriptionView:null,
    editPrescriptionView:null,
    listPrescriptionView:null,
    collection:null,

    routes:{
      "prescriptions":'listPrescriptions',
      "prescriptions/new":'newPrescription',
      "prescriptions/:id/edit":'editPrescription',
    },
    initialize:function (opts) {
      this.collection = opts.collection;
    },
    switchToStateClass:function (el, newClass) {
      $(el).removeClass(this.possibleStateClasses.join(' ')).addClass(newClass);
      return this;
    },
    getParentElement:function () {
      return $("#prescription-app-container");
    },
    listPrescriptions:function () {

      var parent = this.getParentElement();
      this.switchToStateClass(parent, 'list-prescriptions-state');
      this.listPrescriptionView = new PrescriptionApp.Views.PrescriptionTableControlView({
        collection:this.collection,
        el:$('.prescriptions-list-container', parent)
      }).render();

    },
    newPrescription:function () {
      var parent = this.getParentElement();
      var model = null;
      this.collection.each(function (prescription) {
        if (prescription.isNew()) {
          model = prescription;
        }
      });

      if (!model) {
        model = new PrescriptionApp.Models.Prescription();
      }

      this.switchToStateClass(parent, 'new-prescription-state');
      this.newPrescriptionView = new PrescriptionApp.Views.PrescriptionEditView({
        model:model
      }).render();
      $(".prescription-new-container", parent).append(this.newPrescriptionView.el);
    },
    editPrescription:function (id) {
      var ctx = this;
      var parent = this.getParentElement();
      var model = this.collection.get(id);

      if (this.editPrescriptionView) {
        this.editPrescriptionView.close();
        this.editPrescriptionView = null;
      }

      // Fetch from the server if this model is not yet in the collection
      if (!model) {
        model = new PrescriptionApp.Models.Prescription({'_id':id});
        model.fetch({
          error:function () {
            ctx.navigate("#/prescriptions");
          }
        });
      }

      this.switchToStateClass(parent, 'edit-prescription-state');
      this.editPrescriptionView = new PrescriptionApp.Views.PrescriptionEditView({
        model:model
      }).render();
      $(".prescription-edit-container", parent).append(this.editPrescriptionView.el);
    }
  });

  return PrescriptionApp;

});