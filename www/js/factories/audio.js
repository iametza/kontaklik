app.factory('Audio', ['$cordovaMedia', function($cordovaMedia){
  var Audio = {},
      src = cordova.file.dataDirectory + "/myrecording.mp3",
      media,
      iOSPlayOptions = {
        numberOfLoops: 2,
        playAudioWhenScreenIsLocked : false
      };
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
    if(media == undefined) {
      media.stopRecord();
      console.log(media);
    }
  };
  Audio.playRecord = function(){
    if(media == undefined) {
      media.play();
      console.log(media);
    }
  };
  return Audio;
}]);