'use strict';
app.controller('IpuinaCtrl',['$scope', '$compile', 'Kamera', 'Audio', 'Files', 'Database', function($scope, $compile, Kamera, Audio, Files, Database){
  $scope.slides = [];
  var onError = function(err) {
    console.log('err', err);
  };
  Database.getFiles().then(function(files){ console.log(files); $scope.slides = files; }, onError);

  $scope.backgrounds = [
    {
      image: 'assets/backgrounds/background.jpeg',
      text: 'bat',
      id: 1
    },
    {
      image: 'assets/backgrounds/background2.jpeg',
      text: 'Bigarrena',
      id: 2
    },
    {
      image: 'assets/backgrounds/background3.jpeg',
      text: 'Hirugarrena',
      id: 3
    }
  ];
  $scope.addObjetua = function(slide){   
    var objetua = angular.element('<div objetua="objetua" background="'+slide.path+'" x="200" y="200"></div>');
    var el = $compile(objetua)($scope);
    angular.element(document.body).append(objetua);
    $scope.insertHere = el;
  };
  $scope.addBackground = function(background){
    document.body.style.backgroundImage = 'url('+background.image+')';
  };
  $scope.takeGallery = function(atala){
     var options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,     
      encodingType: Camera.EncodingType.JPEG,
      saveToPhotoAlbum: false,
      correctOrientation:true
    };
    Kamera.getPicture(options).then(function(image) {
      Database.saveFile(image, 'irudia', atala).then(function(slide){
          $scope.slides.push(slide);
      }, onError);
    }, onError);
  };
   $scope.takePicture = function(atala){
     var options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,     
      saveToPhotoAlbum: false,
      correctOrientation:true
    };
    Kamera.getPicture(options).then(function(image) {
      Files.saveFile(image).then(function(image){
        Database.saveFile(image, 'irudia', atala).then(function(slide){
          $scope.slides.push(slide);
        }, onError);
      });
    }, onError);
  };
  $scope.startRecord = function() {
    Audio.startRecord();
  };
  $scope.stopRecord = function(){
    Audio.stopRecord();
  };
  $scope.playRecord = function(){
    Audio.playRecord();
  };
}]);