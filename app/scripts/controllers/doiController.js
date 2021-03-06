'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('DoiCtrl', function ($scope, $resource, config, $rootScope, $uibModal, $location) {

      $scope.type = "doi";

      /***** Init ******/
      // When rootScope is ready load the graph
      $rootScope.$watch('ready', function(newVal) {
          if(newVal) {
              $scope.layoutChoice = $rootScope.layout[12];
              $scope.drawDoiGraph();
          }
      });

      /***** Graph creation *****/
      if($rootScope.search != undefined) {
            console.log("can now search");
          if( $rootScope.search.user_id != undefined) {
              $scope.field = "user";
              $scope.value = $rootScope.search.user_id;
          }
          else if( $rootScope.search.post_id != undefined) {
              $scope.field = "post";
              $scope.value = $rootScope.search.post_id;
          }
          else if( $rootScope.search.comment_id != undefined) {
              $scope.field = "comment";
              $scope.value = $rootScope.search.comment_id;
          }
      }
      else {
          $scope.field = "user";
          $scope.value = "34";
      }
      $scope.doiSize = 25;
      $scope.graphSigma = [];

      $scope.drawDoiGraph = function () {
          // // Read the complete graph from api
          if($scope.field == "user" && $scope.user)
              $scope.value = $scope.user;
          else if($scope.field == "post" && $scope.post)
              $scope.value = $scope.post;
          else if($scope.field == "comment" && $scope.comment)
              $scope.value = $scope.comment;
          //else if($scope.field == "tag" && $scope.tag)
          //    $scope.value = $scope.tag;
          if($scope.type === "doi") {
              var CreateGraph = $resource(config.apiUrl + 'doi/complete/'+ $scope.field +'_id/'+ $scope.value, {"max_size": $scope.doiSize});
          } else
              var CreateGraph = $resource(config.apiUrl + 'createGraph/'+ $scope.field +'_id/'+ $scope.value);
          var creategraph = CreateGraph.get();
          creategraph.$promise.then(function (result) {
              var drawGraph = $resource(config.apiUrl + 'draw/'+ result.gid +'/'+ $scope.layoutChoice);
              var drawgraph = drawGraph.get();
              drawgraph.$promise.then(function (result) {
                  $scope.graphSigma = result;
              });
          });
      };

      /*** Sigma Event Catcher  ***/
      $scope.eventCatcher = function (e) {
          switch(e.type) {
              case 'clickNode':
                  if(e.data.node.user_id != undefined) {
                      $scope.elementType = "user";
                      $scope.elementId = e.data.node.user_id;
                  }
                  else if(e.data.node.post_id != undefined) {
                      $scope.elementType = "post";
                      $scope.elementId = e.data.node.post_id;
                  }
                  else if(e.data.node.comment_id != undefined) {
                      $scope.elementType = "comment";
                      $scope.elementId = e.data.node.comment_id;
                  }
                  $scope.openModal($scope.elementType, $scope.elementId);
                  break;
          }
      };
      /********* Modal  ***************/
      $scope.openModal = function (type, id) {
          $scope.elementType = type;
          $scope.elementId = id;

          var modalInstance = $uibModal.open({
              animation: true,
              templateUrl: 'views/ui-elements/modal-view.html',
              controller: 'ModalInstanceCtrl',
              buttons: {
                  Cancel: function () {
                      $("#modal_dialog").dialog("close");
                  }
              },
              resolve: {
                  scopeParent: function() {
                      return $scope; //On passe à la fenêtre modal une référence vers le scope parent.
                  }
              }
          });

          // Catch return, reopen a new modal ?
          modalInstance.result.then(function (res) {
              if(res != undefined) {
                  res = res.split(':');
                  $scope.openModal(res[0], res[1]);
              }
          });
      };

      /*** Search Bar Catcher *****/
      $rootScope.$watch('search', function(newVal) {
          if(newVal != undefined) {
              if( newVal.user_id != undefined) {
                  $scope.field = "user";
                  $scope.value = newVal.user_id;
              }
              else if( newVal.post_id != undefined) {
                  $scope.field = "post";
                  $scope.value = newVal.post_id;
              }
              else if( newVal.comment_id != undefined) {
                  $scope.field = "comment";
                  $scope.value = newVal.comment_id;
              }
              $scope.drawDoiGraph();
          }
      });
      $scope.$on("$destroy", function(){
          //todo stop all active request
          // remove watchers in rootScope
          angular.forEach($rootScope.$$watchers, function(watcher, key) {
              if(watcher.exp === 'search' || watcher.exp === 'ready')
                  $rootScope.$$watchers.splice(key, 1);
          });
      });
});
