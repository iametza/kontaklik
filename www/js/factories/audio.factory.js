app.factory ('Audio', ['$q', function ($q){
  
  var Audio = {},
      media,
      egoera = 'stop',
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
    
    if (audioa.trim () !== ''){
      
      if (media !== undefined)
        media.release ();
        
      window.resolveLocalFileSystemURL (tmp_path, function (dirEntry){
        
        media = new Media (dirEntry.toInternalURL () + audioa + extension, function (){
          
          if (media !== undefined)
            media.release ();
            
          media = undefined;
          egoera = 'stop';
        
          d.resolve ({'path': tmp_path, 'izena': audioa + extension});
          
        }, function (error){
          egoera = 'stop';
          media = undefined;
          d.reject (error);
          console.log ("Audio factory, recordAudio", error);
        });
        
        media.startRecord ();
        egoera = 'record';
        
        
      }, function (error){
        d.reject (error);
        console.log ("Audio factory, resolveLocalFileSystemURL", error);
      });
      
    }
    else
      d.reject ('izen hutsa');
    
    return d.promise;
    
  };
  
  Audio.stopRecord = function (){
    
    if (media !== undefined && egoera == 'record'){
      
      media.stopRecord ();
      egoera = 'stop';
      
    }
    
  };
  
  Audio.play = function (audioa){
    var d = $q.defer ();
    
    if (audioa.trim () !== ''){
      
      window.resolveLocalFileSystemURL (cordova.file.dataDirectory, function (dirEntry){
        
        if (media === undefined || media.src != dirEntry.toInternalURL () + audioa){
          
          if (media !== undefined)
            media.release ();
            
          media = new Media (dirEntry.toInternalURL () + audioa, function (){
            
            if (media !== undefined)
              media.release ();
              
            media = undefined;
            egoera = 'stop';
            
            d.resolve ();
            
          }, function (error){
            egoera = 'stop';
            media = undefined;
            d.reject (error);
            console.log ("Audio factory, play", error);
          });
          
        }
        else
          d.reject ('resume');
          
        if (media !== undefined){
          
          media.play ();
          egoera = 'play';
          
        }
          
      }, function (error){
        d.reject (error);
        console.log ("Audio factory, resolveLocalFileSystemURL", error);
      });
      
    }
    else
      d.reject ('izen hutsa');
    
    return d.promise;
      
  };
  
  Audio.pause = function (){
    
    if (media !== undefined && egoera == 'play'){
      media.pause ();
      egoera = 'pause';
    }
    
  };
  
  Audio.stop = function (){
    
    if (media !== undefined && (egoera == 'play' || egoera == 'pause')){
      media.stop ();
      egoera = 'stop';
    }
    
  };
  
  Audio.getCurrentPosition = function (){
    var d = $q.defer ();
    
    if (media !== undefined && egoera != 'record'){
      
      media.getCurrentPosition (function (position){
        
        d.resolve (position);
        
      }, function (error){
        d.reject (error);
        console.log ("Audio factory, getCurrentPosition", error);
      });
      
    }
    else
      d.reject ();
    
    return d.promise;
    
  };
  
  Audio.getDuration = function (audioa){
    // Ojete: en esta función no uso la variable 'media' para que no interfiera en las otras funciones.
    var d = $q.defer ();
    
    if (audioa.trim () !== ''){
      
      window.resolveLocalFileSystemURL (cordova.file.dataDirectory + audioa, function (fileEntry){
        
        var m = new Media (fileEntry.toInternalURL (), function (){}, function (error){
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
      
      }, function (error){
        d.reject (error);
        console.log ("Audio factory, resolveLocalFileSystemURL", error);
      });
      
    }
    else
      d.resolve (0);
    
    return d.promise;
    
  };
  
  Audio.geratuMakinak = function (){
    
    if (media !== undefined){
      
      switch (egoera){
      
        case 'record':
          media.stopRecord ();
          break;
        
        case 'play':
          media.stop ();
          break;
        
      }
      
      media.release ();
      media = undefined;
      egoera = 'stop';
      
    }
    
  };
  
  Audio.egoera = function (){
    
    return (egoera);
  
  };
  
  return Audio;

}]);