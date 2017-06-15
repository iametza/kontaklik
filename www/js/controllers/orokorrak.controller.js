app.controller('OrokorraCtrl', ['$scope', '$window', 'Soinuak', 'Funtzioak', function($scope, $window, Soinuak, Funtzioak) {
  angular.element('#xuria').hide();
  $scope.audio_mutu = false;

  $scope.audio_on_off = function(audio_fondo) {
    if($scope.audio_mutu) {
      Funtzioak.botoia_animatu(angular.element('#audio_on_off'), 'images/ikonoak/bolumena-off.png', 'images/ikonoak/bolumena-off-press.png');
    } else {
      Funtzioak.botoia_animatu(angular.element('#audio_on_off'), 'images/ikonoak/bolumena-on.png', 'images/ikonoak/bolumena-on-press.png');
    }
    Soinuak.on_off(audio_fondo);
    $scope.audio_mutu = !$scope.audio_mutu;
  };

  $scope.soinuak = Soinuak;

  document.addEventListener('deviceready', function() {

    if ('audio_mutu' in $window.localStorage)
      $scope.audio_mutu = JSON.parse($window.localStorage.audio_mutu);

  });

  document.addEventListener('pause', function() {
    Soinuak.audioak_unload();
  });

  document.addEventListener('resume', function() {

    Soinuak.audioak_load();

    if (Soinuak.is_audio_fondo())
      Soinuak.audio_fondo_play(Soinuak.get_audio_fondo());

  });

  // TIP: CSS ':active' pseudo-class beti funtzionatzeko. Y sigue sin funcionar siempre....
  document.addEventListener("touchstart", function() {}, false);

}]);
