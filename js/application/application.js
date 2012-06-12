define([
  'jquery',
  'lib/backbone-utility',
  'application/couchdb-replication-app/couchdb-replication-app',
  'application/todo-app',
  'application/prescription-app'
], function ($, BackboneUtility, CouchDBReplicationApp, TodoApp, PrescriptionApp) {

  var Application = {};
  Application.start = function () {

    $(function () {

      var mainAppView = new BackboneUtility.Views.AppView({
        el: $("#apps-container")
      });

      $('#apps-container').append('<div class="row app-container" id="replication-app-container"></div>');
      var replicationRouter = new CouchDBReplicationApp.Routers.ReplicationRouter({
        appView: mainAppView
      });

      $('#apps-container').append('<div class="row app-container" id="todo-app-container"></div>');
      var todoRouter = new TodoApp.Routers.TodoRouter({
        appView: mainAppView
      });

      var prescriptionRouter = new PrescriptionApp.Routers.PrescriptionRouter({
        appView: mainAppView
      });

    });

  }

  return Application;

});