app.controller('IpuinakCtrl',['$scope', '$route', 'Database', '$uibModal', function($scope, $route, Database, $uibModal){
  
  $scope.erabiltzailea = {};
  $scope.ipuinak = [];
  
  $scope.init = function () {
    
    $scope.audio_fondo_play ('sarrera');
    
    angular.element ('#eszenatokia').css ('background', "url('images/fondoa.jpg') no-repeat center center fixed");
    angular.element ('#eszenatokia').css ('background-size', "cover");
    
    // Recogemos los datos del erabiltzaile
    Database.getRows ('erabiltzaileak', {'id': $route.current.params.erabiltzailea_id}, '').then (function (emaitza){
      
      if (emaitza.length === 1){
        $scope.erabiltzailea = emaitza[0];
        
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
    
    Database.query ("SELECT ipuinak.*, ifnull(irudiak.path, '') path FROM ipuinak LEFT JOIN eszenak ON eszenak.fk_ipuina=ipuinak.id LEFT JOIN irudiak ON irudiak.id=eszenak.fk_fondoa AND irudiak.atala='fondoa' WHERE ipuinak.fk_erabiltzailea=? ORDER BY ipuinak.izenburua ASC, eszenak.orden ASC", [$scope.erabiltzailea.id]).then (function (emaitza){
      
      angular.forEach (emaitza, function (ipuina){
        
        if ((pos = $scope.ipuina_pos (ipuinak, ipuina.id)) < 0)
          ipuinak.push ({'id': ipuina.id, 'izenburua': ipuina.izenburua, 'path': ipuina.path});
        else if (ipuinak[pos].path.trim () === '')
          ipuinak[pos].path = ipuina.path;
          
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
  
  $scope.ipuina_datuak = function (ipuina_id){
    
    var modala = $uibModal.open ({
      animation: true,
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
      $scope.audio_play ('popup');
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