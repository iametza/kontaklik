app.factory("Kamera", ['ThumbnailService', '$cordovaCamera', '$q', function(ThumbnailService, $cordovaCamera, $q) {
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
  /**
   * Irudiak txikitzeko funtzioa
   *
   */
  Kamera.generateThumbnail = function(image, png) {
    var d = $q.defer();
    var newImg = new Image();
    var formatua = png == true? 'image/png' : 'image/jpeg';
    newImg.onload = function(){

      var height = (newImg.naturalHeight*300)/newImg.naturalWidth;

      ThumbnailService.generate(image, { width: 300, height: height, type: formatua}).then(function(data){
        d.resolve(data);
      }, function(err) {
        d.reject(err);
      });
    }
    newImg.src = image;
    return d.promise;
  };
  return Kamera;
}]);
