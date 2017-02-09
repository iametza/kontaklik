app.factory ('Soinuak', ['$window', '$cordovaNativeAudio', function ($window, $cordovaNativeAudio){
  
  var Soinuak = {};
  var audioak = [];
  var audio_mutu = false;
  var audio_fondo = {'izena': '', 'playing': false};
  
  document.addEventListener ('deviceready', function (){
    
    if ('audio_mutu' in $window.localStorage)
      audio_mutu = JSON.parse ($window.localStorage.audio_mutu);
      
    $cordovaNativeAudio.preloadComplex ('sarrera', 'assets/audio/sarrera.mp3', 1, 1).then (function (msg){
    
      if (msg == 'OK')
        audioak.push ('sarrera');
        
    }, function (error){
      console.log ("Soinuak factory, preloadComplex sarrera", error);
    });
    
    $cordovaNativeAudio.preloadSimple ('click', 'assets/audio/click.mp3').then (function (msg){
    
      if (msg == 'OK')
        audioak.push ('click');
      
    }, function (error){
      console.log ("Soinuak factory, preloadSimple click", error);
    });
    
    $cordovaNativeAudio.preloadSimple ('popup', 'assets/audio/popup.mp3').then (function (msg){
    
      if (msg == 'OK')
        audioak.push ('popup');
      
    }, function (error){
      console.log ("Soinuak factory, preloadSimple popup", error);
    });
    
  });
  
  Soinuak.audio_play = function (audio){
    
    if (!audio_mutu && audioak.indexOf (audio) >= 0)
      $cordovaNativeAudio.play (audio);
    
  };
  
  Soinuak.audio_stop = function (audio){
    
    if (audioak.indexOf (audio) >= 0)
      $cordovaNativeAudio.stop (audio);
    
  };
  
  Soinuak.audio_fondo_play = function (audio){
    
    if (!audio_mutu && audioak.indexOf (audio) >= 0){
      
      if (!audio_fondo.playing){
        
        fondo_play_now (audio);
        
      }
      else if (audio_fondo.izena != audio){
        
        $cordovaNativeAudio.stop (audio_fondo.izena);
        
        fondo_play_now (audio);
        
      }
      
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
  
  Soinuak.on_off = function (audio_fondo){
    
    audio_mutu = !audio_mutu;
    
    $window.localStorage.audio_mutu = JSON.stringify (audio_mutu);
    
    if (audio_mutu && audio_fondo.playing)
      this.audio_fondo_stop ();
    else if (!audio_mutu)
      this.audio_fondo_play (audio_fondo);
    
  };
  
  return Soinuak;

}]);