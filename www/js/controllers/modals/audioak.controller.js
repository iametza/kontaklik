app.controller('AudioakCtrl', ['$scope', '$uibModalInstance', 'Audio', 'audioa', function($scope, $uibModalInstance, Audio, audioa) {
  $scope.playAudioa = function() {
    Audio.playMp3(audioa.audioa);
  };

  $scope.saveAudioa = function() {
    $uibModalInstance.close({
      aukera: 1,
      audioa: audioa
    });
  };

  $scope.itxi = function() {
    $uibModalInstance.close({
      aukera: 0
    });
  };
}]);
