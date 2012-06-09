define([
  'jquery',
  'application/couchdb-replication-app/couchdb-replication-app',
  'application/todo-app',
  'application/prescription-app'
], function ($, CouchDBReplicationApp, TodoApp, PrescriptionApp) {

  var Application = {};
  Application.start = function () {

    $(function () {
      $('#apps-container').append('<div class="row app-container" id="replication-app-container"></div>');
      var replicationRouter = new CouchDBReplicationApp.Routers.ReplicationRouter({
        parentContainerSelector:'#replication-app-container'
      });

      $('#apps-container').append('<div class="row app-container" id="todo-app-container"></div>');
      var todoRouter = new TodoApp.Routers.TodoRouter({
        parentContainerSelector:'#todo-app-container'
      });

      var prescriptionRouter = new PrescriptionApp.Routers.PrescriptionRouter({
        parentContainer: $("#apps-container").append('<div class="row app-container" id="prescription-app-container"></div>')
      });

    });

  }

  return Application;

});