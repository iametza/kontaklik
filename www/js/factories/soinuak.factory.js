app.factory ('Soinuak', ['$window', '$cordovaNativeAudio', function ($window, $cordovaNativeAudio){
  
  var Soinuak = {};
  var audioak = [];
  var audio_path = 'assets/audio/'; // relativo a 'www/'
  var audio_mutu = false;
  var audio_fondo = {'izena': '', 'playing': false};
  var audio_fondo_before_load = ''; // La primera vez que se pide el audio de fondo no está cargado....
  
  document.addEventListener ('deviceready', function (){
    
    if ('audio_mutu' in $window.localStorage)
      audio_mutu = JSON.parse ($window.localStorage.audio_mutu);
      
    preloadComplex ('sarrera', 'sarrera.mp3');
    
    preloadSimple ('click', 'click.mp3');
    preloadSimple ('popup', 'popup.mp3');
    
  });
  
  function preloadComplex (id, audioa){
    
    $cordovaNativeAudio.preloadComplex (id, audio_path + audioa, 1, 1).then (function (msg){
      
      if (msg == 'OK'){
        
        audioak.push (id);
        
        if (audio_fondo_before_load == id)
          fondo_play_now (id);
          
      }
        
    }, function (error){
      console.log ("Soinuak factory, preloadComplex '" + id + "'", error);
    });
    
  }
  
  function preloadSimple (id, audioa){
    
    $cordovaNativeAudio.preloadSimple (id, audio_path + audioa).then (function (msg){
      
      if (msg == 'OK')
        audioak.push (id);
      
    }, function (error){
      console.log ("Soinuak factory, preloadSimple '" + id + "'", error);
    });
    
  }
  
  Soinuak.audio_play = function (audio){
    
    if (!audio_mutu && audioak.indexOf (audio) >= 0)
      $cordovaNativeAudio.play (audio);
    
  };
  
  Soinuak.audio_stop = function (audio){
    
    if (audioak.indexOf (audio) >= 0)
      $cordovaNativeAudio.stop (audio);
    
  };
  
  Soinuak.audio_fondo_play = function (audio){
    
    if (!audio_mutu){
      
      if (audioak.indexOf (audio) >= 0){
        
        if (!audio_fondo.playing){
          
          fondo_play_now (audio);
          
        }
        else if (audio_fondo.izena != audio){
          
          $cordovaNativeAudio.stop (audio_fondo.izena);
          
          fondo_play_now (audio);
          
        }
        
      }
      else // El audio no está cargado. Lo guardamos para reproducirlo cuando se cargue....
        audio_fondo_before_load = audio;
      
    }
    
  };
  
  function fondo_play_now (audio){
    
    audio_fondo.izena = audio;
    audio_fondo.playing = true;
    
    $cordovaNativeAudio.loop (audio);
    
  }
  
  Soinuak.audio_fondo_stop = function (){
    
    if (audio_fondo.playing){
      
      $cordovaNativeAudio.stop (audio_fondo.izena);
      
      audio_fondo.izena = '';
      audio_fondo.playing = false;
      
    }
    
  };
  
  Soinuak.on_off = function (audio_fondo_izena){
    
    audio_mutu = !audio_mutu;
    
    $window.localStorage.audio_mutu = JSON.stringify (audio_mutu);
    
    if (audio_mutu && audio_fondo.playing)
      this.audio_fondo_stop ();
    else if (!audio_mutu)
      this.audio_fondo_play (audio_fondo_izena);
    
  };
  
  return Soinuak;

}]);