app.controller('IpuinakCtrl',['$scope', '$route', '$timeout', '$location', 'Database', 'Funtzioak', '$uibModal', function($scope, $route, $timeout, $location, Database, Funtzioak, $uibModal){

  $scope.erabiltzailea = {};
  $scope.ipuinak = [];

  $scope.init = function () {

    $scope.soinuak.audio_fondo_play ('sarrera');

    angular.element ('#eszenatokia').css ('background', "url('images/defektuzko-fondoa.png') no-repeat center center fixed");
    angular.element ('#eszenatokia').css ('background-size', "cover");

    // Recogemos los datos del erabiltzaile
    Database.getRows ('erabiltzaileak', {'id': $route.current.params.erabiltzailea_id}, '').then (function (emaitza){

      if (emaitza.length === 1){
        $scope.erabiltzailea = emaitza[0];
        $scope.erabiltzailea.irudia = cordova.file.dataDirectory + $scope.erabiltzailea.argazkia;
        // Recogemos los ipuinak del erabiltzaile
        $scope.getIpuinak ();
      }
      else
        window.location = "#/";

    }, function (error){
      console.log ("IpuinakCtrl, erabiltzaile datuak jasotzen", error);
    });

  };

  $scope.getIpuinak = function (){
    var ipuinak = [];

    Database.query ("SELECT ipuinak.*, ifnull(irudiak.cordova_file, '') cordova_file, ifnull(irudiak.path, '') path, ifnull(irudiak.izena, '') izena FROM ipuinak LEFT JOIN eszenak ON eszenak.fk_ipuina=ipuinak.id LEFT JOIN irudiak ON irudiak.id=eszenak.fk_fondoa AND irudiak.atala='fondoa' WHERE ipuinak.fk_erabiltzailea=? ORDER BY ipuinak.izenburua ASC, eszenak.orden ASC", [$scope.erabiltzailea.id]).then (function (emaitza){

      angular.forEach (emaitza, function (ipuina){

        if ((pos = $scope.ipuina_pos (ipuinak, ipuina.id)) < 0)
          ipuinak.push ({'id': ipuina.id, 'izenburua': ipuina.izenburua, 'fullPath': Funtzioak.get_fullPath (ipuina)});
        else if (ipuinak[pos].fullPath.trim () === '')
          ipuinak[pos].fullPath = Funtzioak.get_fullPath (ipuina);

      });

      $scope.ipuinak = ipuinak;

    }, function (error){
      console.log ("IpuinakCtrl, getIpuinak", error);
    });


  };

  $scope.ipuina_pos = function (lista, id){

    for (var i = 0; i < lista.length; i++){
      if (lista[i].id == id)
        return (i);
    }

    return (-1);

  };
  $scope.atzera = function(id) {
    Funtzioak.botoia_animatu(angular.element('#atzera_joan_ipuinak'), 'images/ikonoak/atzera.png', 'images/ikonoak/atzera-press.png');
    $scope.soinuak.audio_play ('click');
    $timeout(function() {
      $location.url('/');
    }, 500);
  };
  $scope.ipuina_datuak = function (ipuina_id){

    var modala = $uibModal.open ({
      animation: true,
      backdrop: 'static',
      templateUrl: 'views/modals/ipuina_datuak.html',
      controller: 'ModalIpuinaDatuakCtrl',
      resolve: {
        erabiltzailea_id: function () {
          return $scope.erabiltzailea.id;
        },
        ipuina_id: function () {
          return ipuina_id;
        }
      }
    });

    modala.rendered.then (function (){
      $scope.soinuak.audio_play ('popup');
    });

    modala.result.then (function (){

      // Recogemos los ipuinak del erabiltzaile
      $scope.getIpuinak ();

    }, function (error){
      console.log ("IpuinakCtrl, ipuina_datuak modala", error);
    });

  };

  document.addEventListener ('deviceready', function (){

    $scope.init ();

  });

}]);
