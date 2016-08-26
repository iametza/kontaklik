'use strict';
app.controller('MenuaCtrl',['$scope', 'Audio', function($scope, Audio){
  document.addEventListener('deviceready', function() {
    Audio.play('sarrera', 'assets/music/sarrera.mp3');
  }, false);
}]);