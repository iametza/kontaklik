app.factory("Kamera", ['$cordovaCamera', '$q', function($cordovaCamera, $q) {
  var Kamera = {};
  Kamera.getPicture = function(options) {
    var d = $q.defer();
    $cordovaCamera.getPicture(options).then(function(imageData) {
      d.resolve(imageData);
    }, function(err) {
      d.reject(err);
    });
    return d.promise;
  };
  return Kamera;
}]);
