app.factory('Audio', ['$q', '$cordovaMedia', '$cordovaFile', function($q, $cordovaMedia, $cordovaFile) {

  var Audio = {},
    media,
    mediaMp3,
    egoera = 'stop',
    extension = '',
    tmp_path = '';
  function mediaError(e) {
      console.log('err', e, JSON.stringify(e));
  }
  document.addEventListener("deviceready", function() {

    switch (device.platform) {
      case 'iOS':
        extension = ".wav";
        break;
      case 'Android':
        extension = ".amr";
        break;
    }
    $cordovaFile.checkDir(cordova.file.dataDirectory, 'audioak').then(function(res) {
      if (res.isDirectory !== true) {
        $cordovaFile.createDir(cordova.file.dataDirectory, 'audioak');
      }
    }, function(error) {
      $cordovaFile.createDir(cordova.file.dataDirectory, 'audioak');
    });
    tmp_path = cordova.file.dataDirectory + 'audioak';
  }, false);

  Audio.startRecord = function(audioa) {
    var d = $q.defer();

    if (audioa.trim() !== '') {

      if (media !== undefined)
        media.release();

      //window.resolveLocalFileSystemURL(tmp_path, function(dirEntry) {

        media = new Media(tmp_path + '/' + audioa + extension, function() {

          if (media !== undefined)
            media.release();

          media = undefined;
          egoera = 'stop';

          d.resolve({
            'path': tmp_path,
            'izena': audioa + extension
          });

        }, function(error) {
          egoera = 'stop';
          media = undefined;
          d.reject(error);
          console.log("Audio factory, recordAudio", error);
        });

        media.startRecord();
        egoera = 'record';


      /*}, function(error) {
        d.reject(error);
        console.log("Audio factory, resolveLocalFileSystemURL", error);
      });*/

    } else
      d.reject('izen hutsa');

    return d.promise;

  };

  Audio.stopRecord = function() {

    if (media !== undefined && egoera == 'record') {

      media.stopRecord();
      egoera = 'stop';

    }

  };

  Audio.playMp3 = function(src){
    //console.log('matzu play', cordova.file.applicationDirectory+ 'www/' +src);
    mediaMp3 = $cordovaMedia.newMedia(cordova.file.applicationDirectory + 'www/' + src);
    mediaMp3.play(); // Android
  };

  Audio.stopMp3 = function(){
    if (mediaMp3 !== undefined)
      mediaMp3.stop();
  };

  Audio.play = function(audioa, mota) {
    var d = $q.defer();
    var audio_file = mota == 'dataDirectory'? tmp_path + '/' + audioa : cordova.file.applicationDirectory + 'www/' + audioa
    console.log(mota, audio_file, media);
    if (audioa.trim() !== '') {

      //window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dirEntry) {

        if (media === undefined || media.src != audio_file) {

          if (media !== undefined)
            media.release();

          media = new Media(audio_file, function() {

            if (media !== undefined)
              media.release();

            media = undefined;
            egoera = 'stop';

            d.resolve();

          }, function(error) {
            egoera = 'stop';
            media = undefined;
            d.reject(error);
            console.log("Audio factory, play", error);
          });

        } else
          d.reject('resume');

        if (media !== undefined) {

          media.play();
          egoera = 'play';

        }

      /*}, function(error) {
        d.reject(error);
        console.log("Audio factory, resolveLocalFileSystemURL", error);
      });*/

    } else
      d.reject('izen hutsa');

    return d.promise;

  };

  Audio.pause = function() {

    if (media !== undefined && egoera == 'play') {
      media.pause();
      egoera = 'pause';
    }

  };

  Audio.stop = function() {

    if (media !== undefined && (egoera == 'play' || egoera == 'pause')) {
      media.stop();
      egoera = 'stop';
    }

  };

  Audio.getCurrentPosition = function() {
    var d = $q.defer();

    if (media !== undefined && egoera != 'record') {

      media.getCurrentPosition(function(position) {

        d.resolve(position);

      }, function(error) {
        d.reject(error);
        console.log("Audio factory, getCurrentPosition", error);
      });

    } else
      d.reject();

    return d.promise;

  };

  Audio.getDuration = function(audioa, mota) {
    // Ojete: en esta función no uso la variable 'media' para que no interfiera en las otras funciones.
    var d = $q.defer();

    if (audioa.trim() !== '') {
        //window.resolveLocalFileSystemURL(cordova.file.dataDirectory + audioa, function(fileEntry) {
        var audio_file = mota == 'dataDirectory'? tmp_path + '/' + audioa : cordova.file.applicationDirectory+ 'www/' + audioa;
        console.log('getDuration', audio_file, mota);
        var m = new Media(audio_file, function() {}, function(error) {
          d.reject(error);
          console.log("Audio factory, getDuration", error);
        });


        // ojo que sin hacer play/stop no funtziona....
        m.play();
        m.stop();

        var counter = 0;
        var timerDur = setInterval(function() {

          counter = counter + 100;

          var duration = m.getDuration();

          if (duration > 0 || counter > 2000) {
            clearInterval(timerDur);
            m.release();
            d.resolve(Math.ceil(duration));
          }

        }, 100);

      /*}, function(error) {
        d.reject(error);
        console.log("Audio factory, resolveLocalFileSystemURL", error);
      });*/

    } else
      d.resolve(0);

    return d.promise;

  };

  Audio.geratuMakinak = function() {

    if (media !== undefined) {

      switch (egoera) {

        case 'record':
          media.stopRecord();
          break;

        case 'play':
          media.stop();
          break;

      }

      media.release();
      media = undefined;
      egoera = 'stop';

    }

  };

  Audio.egoera = function() {

    return (egoera);

  };

  return Audio;

}]);
