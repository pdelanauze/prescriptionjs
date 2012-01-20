define(['backbone', 'underscore', 'modelbinding'], function (Backbone, _, ModelBinding) {

  var PrescriptionApp = {
    Models:{},
    Collections:{},
    Views:{},
    Routers:{},
    Templates:{
      PRESCRIPTION_TABLE_STRUCTURE:'<thead>' +
          '<tr>' +
          '<% _.each(columns, function(c){ %>' +
          '<th class="<%= c.value %>"><%= c.name %></th>' +
          '<% }); %>' +
          '</tr>' +
          '</thead>' +
          '<tbody></tbody>'

    }
  };

  PrescriptionApp.Models.Prescription = Backbone.Model.extend({
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
    }
  });

  PrescriptionApp.Collections.PrescriptionCollection = Backbone.Collection.extend({
    model:PrescriptionApp.Models.Prescription,
    url:'/prescriptions'
  });

  PrescriptionApp.Views.PrescriptionTableItemView = Backbone.View.extend({
    className:'prescription-table-item-view',
    tagName:'tr',
    initialize:function () {
      _.bindAll(this, 'render');
      this.model.bind('remove', this.remove);
    },
    render:function () {
      return this;
    }
  });

  PrescriptionApp.Views.PrescriptionTableView = Backbone.View.extend({
    className:'zebra-striped prescription-table-view',
    tagName:'table',
    template:PrescriptionApp.Templates.PRESCRIPTION_TABLE_STRUCTURE,
    events:{

    },
    initialize:function (options) {
      _.bindAll(this, 'render', 'itemAdded', 'itemRemoved');
      this.collection.bind('add', this.itemAdded);
      this.collection.bind('remove', this.itemRemoved);

      // Pre-render
      $(this.el).html(_.template(this.template, {
        columns:[
          {name:'ID', value:'id'},
          {name:'Name', value:'name'},
          {name:'Domain', value:'domain'},
          {name:'Path', value:'path'},
          {name:'Last updated', value:'updatedAt'}
        ]
      }));

    },
    render:function () {
      return this;
    },
    itemAdded:function (model) {
      var itemView = new PrescriptionApp.Views.PrescriptionTableItemView({
        model:model
      }).render();
      this.$('tbody:first').prepend(itemView.el);
    },
    itemRemoved:function (model) {
      console.log('item removed', arguments);
    }
  });

  PrescriptionApp.Views.PrescriptionTableControlView = Backbone.View.extend({
    className:'prescription-table-control-view',
    tableView:null,
    template:'<div class="pull-right control top">' +
        '<a href="#/prescriptions/new" class="btn primary">New prescription</a>' +
        '</div>' +
        '<div class="table-container"></div>',
    initialize:function (options) {
      _.bindAll(this, 'render');
      this.tableView = new PrescriptionApp.Views.PrescriptionTableView({
        collection:options.collection
      });

      this.render();
      this.$('.table-container:first').html(this.tableView.el);
    },
    render:function () {
      $(this.el).html(_.template(this.template));
      return this;
    }
  });

  PrescriptionApp.Views.PrescriptionEditView = Backbone.View.extend({
    className:'prescription-edit-view',
    template:'<form action="#/prescriptions" method="POST"><fieldset>' +
        '<div class="clearfix">' +
        '<label for="prescription-<%= id %>-name">Name</label>' +
        '<div class="input">' +
        '<input class="xlarge" id="prescription-<%= id %>-name" value="<%= name %>" size="30" type="text"/> ' +
        '</div>' +
        '</div>' +
        '<div class="clearfix">' +
        '<label for="prescription-<%= id %>-domain">Domain</label>' +
        '<div class="input">' +
        '<input class="xlarge" id="prescription-<%= id %>-domain" value="<%= domain %>" size="30" type="text"/> ' +
        '</div>' +
        '</div>' +
        '<div class="clearfix">' +
        '<label for="prescription-<%= id %>-path">Path</label>' +
        '<div class="input">' +
        '<input class="xlarge" id="prescription-<%= id %>-path" value="<%= path %>" size="30" type="text"/> ' +
        '</div>' +
        '</div>' +
        '<div class="clearfix">' +
        '<label for="prescription-<%= id %>-script">Script</label>' +
        '<div class="input">' +
        '<textarea class="xxlarge" id="prescription-<%= id %>-script" rows="7"><%= script %></textarea> ' +
        '</div>' +
        '</div>' +
        '<div class="actions">' +
        '<button class="btn primary" type="submit">Save</button>' +
        '&nbsp;<button class="btn" type="reset">Reset</button>' +
        '</div> ' +
        '</fieldset></form>',

    events:{

    },
    initialize:function () {
      _.bindAll(this, 'render');

      var data = this.model.toJSON();
      if (!data.id){
        data.id = 'new';
      }

      $(this.el).html(_.template(this.template, data));
    },
    render:function () {

      return this;
    }
  });


  PrescriptionApp.Routers.PrescriptionRouter = Backbone.Router.extend({

    possibleStateClasses:[
      'list-prescriptions-state',
      'edit-prescription-state',
      'new-prescription-state',
    ],

    newPrescriptionView: null,

    routes:{
      "prescriptions/new": 'newPrescription'
    },
    switchToStateClass: function(el, newClass){
      $(el).removeClass(this.possibleStateClasses.join(' ')).addClass(newClass);
      return this;
    },
    getParentElement: function(){
      return $("#prescription-app-container");
    },
    newPrescription:function () {
      var parent = this.getParentElement();
      this.switchToStateClass(parent, 'edit-prescription-state new-prescription-state');

      this.newPrescriptionView = new PrescriptionApp.Views.PrescriptionEditView({
        model: new PrescriptionApp.Models.Prescription(),
        el: $(".prescription-edit-container", parent)
      });
    }
  });

  return PrescriptionApp;

});