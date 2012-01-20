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

  return PrescriptionApp;

});