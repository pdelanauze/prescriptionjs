define(['backbone', 'underscore', 'backbone.modelbinding'], function (Backbone, _, ModelBinding) {

  var PrescriptionApp = {
    Models:{},
    Collections:{},
    Views:{},
    Routers:{},
    Templates:{
      PRESCRIPTION_TABLE_CONTENTS:'<thead>' +
              '<tr>' +
              '<% _.each(columns, function(c){ %>' +
              '<th><%= c %></th>' +
              '<% }); %>' +
              '</tr>' +
              '</thead>' +
              '<tbody>' +
              '<% _.each(rows, function(row){ %>' +
              '<tr>' +
              '<% _.each(row.fields, function(field){ %>' +
              '<td class="field-<%= field.name %>"><%= field.value %></td>' +
              '<% }); %>' +
              '</tr>' +
              '<% }); %>' +
              '' +
              '</tbody>'

    }
  };

  PrescriptionApp.Models.Prescription = Backbone.Model.extend({

  });

  PrescriptionApp.Collections.PrescriptionCollection = Backbone.Collection.extend({
    model:PrescriptionApp.Models.Prescription,
    url:'/prescriptions'
  });

  PrescriptionApp.Views.PrescriptionTableItemView = Backbone.View.extend({
    className:'prescription-table-item-view'
  });

  PrescriptionApp.Views.PrescriptionTableView = Backbone.View.extend({
    className:'prescription-table-view',
    tagName:'table',
    template: PrescriptionApp.Templates.PRESCRIPTION_TABLE_CONTENTS,
    events: {

    },
    initialize: function(options){
      _.bindAll(this, 'render');
    },
    render: function(){
      return this;
    }
  });

  PrescriptionApp.Views.PrescriptionTableControlView = Backbone.View.extend({
    className:'prescription-table-control-view'
  });

  return PrescriptionApp;

});