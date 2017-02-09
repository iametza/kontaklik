app.controller ('OrokorraCtrl', ['$scope', '$window', 'Soinuak', function ($scope, $window, Soinuak){
  
  $scope.audio_mutu = false;
  
  $scope.audio_on_off = function (audio_fondo){
    
    Soinuak.on_off (audio_fondo);
    
    $scope.audio_mutu = !$scope.audio_mutu;
    
  };
  
  $scope.audio_play = Soinuak.audio_play;
  
  document.addEventListener ('deviceready', function (){
    
    if ('audio_mutu' in $window.localStorage)
      $scope.audio_mutu = JSON.parse ($window.localStorage.audio_mutu);
    
  });
  
}]);