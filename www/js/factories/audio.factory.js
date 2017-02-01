app.factory ('Audio', ['$q', '$cordovaMedia', '$cordovaNativeAudio', function ($q, $cordovaMedia, $cordovaNativeAudio){
  
  var Audio = {},
      media,
      egoera = 'stopped',
      extension = '',
      tmp_path = '';
      /*,
      iOSPlayOptions = {
        numberOfLoops: 2,
        playAudioWhenScreenIsLocked : false
      }*/
      
  document.addEventListener ("deviceready",function (){
    
    switch (device.platform){
      case 'iOS':
        extension = ".wav";
        tmp_path = cordova.file.tempDirectory;
        break;
      case 'Android':
        extension = ".amr";
        tmp_path = cordova.file.externalRootDirectory;
        break;
    }
    
  }, false);
  
  Audio.startRecord = function (audioa){
    var d = $q.defer ();
    
    if (media !== undefined)
      media.release ();
      
    if (audioa.trim () !== ''){
      
      media = new Media (audioa + extension, function (){
      
        d.resolve ({'path': tmp_path, 'izena': audioa + extension});
        
      }, function (error){
        egoera = 'stopped';
        d.reject (error);
        console.log ("Audio factory, recordAudio", error);
      });
      
      media.startRecord ();
      egoera = 'recording';
      
    }
    else
      d.reject ('izen hutsa');
      
    return d.promise;
    
  };
  
  Audio.stopRecord = function (){
    
    if (media !== undefined){
      
      media.stopRecord ();
      media.release ();
      media = undefined;
      egoera = 'stopped';
      
    }
    
  };
  
  Audio.play = function (audioa){
    var d = $q.defer ();
    
    if (audioa.trim () !== '' && (media === undefined || media.src != cordova.file.dataDirectory + audioa)){
      
      if (media !== undefined)
        media.release ();
        
      media = new Media (cordova.file.dataDirectory + audioa, function (){
        
        if (media !== undefined)
          media.release ();
          
        media = undefined;
        egoera = 'stopped';
        
        d.resolve ();
        
      }, function (error){
        egoera = 'stopped';
        d.reject (error);
        console.log ("Audio factory, play", error);
      });
    }
    else
      d.reject ('izen hutsa');
    
    if (media !== undefined){
      media.play ();
      egoera = 'playing';
    }
    
    return d.promise;
      
  };
  
  Audio.pause = function (){
    
    if (media !== undefined){
      media.pause ();
      egoera = 'paused';
    }
    
  };
  
  Audio.stop = function (){
    
    if (media !== undefined){
      
      media.stop ();
      /* Lo siguiente no hace falta ya que se hace en el promise de Audio.play
       *media.release ();
      media = undefined;*/
      egoera = 'stopped';
      
    }
    
  };
  
  Audio.getDuration = function (audioa){
    // Ojete: en esta función no uso la variable 'media' para que no interfiera en las otras funciones.
    var d = $q.defer ();
    
    if (audioa.trim () !== ''){
      var m = new Media (cordova.file.dataDirectory + audioa, function (){}, function (error){
        d.reject (error);
        console.log ("Audio factory, getDuration", error);
      });
      
      // ojo que sin hacer play/stop no funtziona....
      m.play ();
      m.stop ();
      
      var counter = 0;
      var timerDur = setInterval (function (){
        
        counter = counter + 100;
        
        var duration = m.getDuration ();
        
        if (duration > 0 || counter > 2000){
          clearInterval (timerDur);
          m.release ();
          d.resolve (Math.ceil (duration));
        }
        
      }, 100);
      
    }
    else
      d.resolve (0);
    
    return d.promise;
    
  };
  
  Audio.geratuMakinak = function (){
    
    if (media !== undefined){
      
      switch (egoera){
      
        case 'recording':
          media.stopRecord ();
          break;
        
        case 'playing':
          media.stop ();
          break;
        
      }
      
      media.release ();
      media = undefined;
      egoera = 'stopped';
      
    }
    
  };
  
  Audio.egoera = function (){
    
    return (egoera);
  
  };
  
  /*Audio.play = function(izena, src) {
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
  };*/
  
  return Audio;

}]);