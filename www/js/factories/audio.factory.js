app.factory('Audio', ['$cordovaMedia', '$cordovaNativeAudio', function($cordovaMedia, $cordovaNativeAudio){
  var Audio = {},
      src,
      media,
      iOSPlayOptions = {
          numberOfLoops: 2,
          playAudioWhenScreenIsLocked : false
      };
  document.addEventListener("deviceready",function() {
    src = "myrecording.mp3";    
  }, false);
  var onError = function(err) {
    console.log('err', err);
  };
  var onSuccess = function(success) {
    console.log('success', success);
  };
  var onStatus = function(status) {
    console.log('status', status);
  };
  Audio.startRecord = function() {    
     media = new Media(src, onSuccess, onError, onStatus);
     media.startRecord();
     console.log(media);
  };
  Audio.stopRecord = function(){
    if(media != undefined) {
      media.stopRecord();
      console.log(media);
    }
  };
  Audio.playRecord = function(){
    if(media != undefined) {
      media.play();
      console.log(media);
    }
  };
  Audio.play = function(izena, src) {
    if(src != undefined && izena != undefined) {
      $cordovaNativeAudio.preloadSimple(izena, src).then(function() {
        $cordovaNativeAudio.loop(izena);
      }, function(err) { console.log(err); });    
    }
  };
  Audio.stop = function(izena) {
    if (izena != undefined) {    
      $cordovaNativeAudio.stop(izena);
      $cordovaNativeAudio.unload(izena);
    }
  };
  return Audio;
}]);