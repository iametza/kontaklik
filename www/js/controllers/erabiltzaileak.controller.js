app.controller('ErabiltzaileakCtrl', ['$scope', 'Database', '$uibModal', function($scope, Database, $uibModal) {

  $scope.erabiltzaileak = [];

  $scope.init = function() {
    $scope.soinuak.audio_fondo_play('sarrera');
    angular.element('#eszenatokia').css('background', "url('images/defektuzko-fondoa.png') no-repeat center center fixed");
    angular.element('#eszenatokia').css('background-size', "cover");
    // Recogemos los erabiltzaileak
    $scope.getErabiltzaileak();

  };

  $scope.getErabiltzaileak = function() {
    Database.getRows('erabiltzaileak', '', ' ORDER BY izena ASC').then(function(emaitza) {
      $scope.erabiltzaileak = emaitza;
      angular.forEach(emaitza, function(erab, ind) {
        if (erab.argazkia.trim() != '')
          $scope.erabiltzaileak[ind].argazkia = cordova.file.dataDirectory + erab.argazkia;
      });

    }, function(error) {
      console.log("ErabiltzaileakCtrl, getErabiltzaileak", error);
    });

  };

  $scope.erabiltzailea_datuak = function(erabiltzailea_id) {

    var modala = $uibModal.open({
      animation: true,
      backdrop: 'static',
      templateUrl: 'views/modals/erabiltzailea_datuak.html',
      controller: 'ModalErabiltzaileaDatuakCtrl',
      resolve: {
        erabiltzailea_id: function() {
          return erabiltzailea_id;
        }
      }
    });

    modala.rendered.then(function() {
      $scope.soinuak.audio_play('popup');
    });

    modala.result.then(function() {

      // Recogemos los erabiltzaileak
      $scope.getErabiltzaileak();

    }, function(error) {
      console.log("ErabiltzaileakCtrl, erabiltzailea_datuak modala", error);
    });

  };

  document.addEventListener('deviceready', function() {

    $scope.init();

  });

}]);
