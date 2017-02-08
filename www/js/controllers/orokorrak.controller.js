app.controller ('OrokorraCtrl', ['$scope', '$window', '$cordovaNativeAudio', function ($scope, $window, $cordovaNativeAudio){
  
  $scope.audioak = [];
  $scope.audio_mutu = false;
  $scope.audio_fondo = {'izena': '', 'playing': false};
  
  $scope.init = function (){
    
    if ('audio_mutu' in $window.localStorage)
      $scope.audio_mutu = JSON.parse ($window.localStorage.audio_mutu);
      
    $cordovaNativeAudio.preloadComplex ('sarrera', 'assets/audio/sarrera.mp3', 1, 1).then (function (msg){
    
      if (msg == 'OK'){
        $scope.audioak.push ('sarrera');
        
        $scope.audio_fondo_play ('sarrera');
      }
        
    }, function (error){
      console.log ("OrokorraCtrl, preloadComplex sarrera", error);
    });
    
    $cordovaNativeAudio.preloadSimple ('click', 'assets/audio/click.mp3').then (function (msg){
    
      if (msg == 'OK')
        $scope.audioak.push ('click');
      
    }, function (error){
      console.log ("OrokorraCtrl, preloadSimple click", error);
    });
    
    $cordovaNativeAudio.preloadSimple ('popup', 'assets/audio/popup.mp3').then (function (msg){
    
      if (msg == 'OK')
        $scope.audioak.push ('popup');
      
    }, function (error){
      console.log ("OrokorraCtrl, preloadSimple popup", error);
    });
    
  };
  
  $scope.audio_play = function (audio){
    
    if (!$scope.audio_mutu && $scope.audioak.indexOf (audio) >= 0)
      $cordovaNativeAudio.play (audio);
    
  };
  
  $scope.audio_stop = function (audio){
    
    if ($scope.audioak.indexOf (audio) >= 0)
      $cordovaNativeAudio.stop (audio);
    
  };
  
  $scope.audio_fondo_play = function (audio){
    
    if (!$scope.audio_mutu && $scope.audioak.indexOf (audio) >= 0){
      
      if (!$scope.audio_fondo.playing){
        
        fondo_play (audio);
        
      }
      else if ($scope.audio_fondo.izena != audio){
        
        $cordovaNativeAudio.stop ($scope.audio_fondo.izena);
        
        fondo_play (audio);
        
      }
      
    }
    
  };
  
  function fondo_play (audio){
    
    $scope.audio_fondo.izena = audio;
    $scope.audio_fondo.playing = true;
    
    $cordovaNativeAudio.loop (audio);
    
  }
  
  $scope.audio_fondo_stop = function (){
    
    if ($scope.audio_fondo.playing){
      
      $cordovaNativeAudio.stop ($scope.audio_fondo.izena);
      
      $scope.audio_fondo.izena = '';
      $scope.audio_fondo.playing = false;
      
    }
    
  };
  
  $scope.audio_on_off = function (audio_fondo){
    
    $scope.audio_mutu = !$scope.audio_mutu;
    
    $window.localStorage.audio_mutu = JSON.stringify ($scope.audio_mutu);
    
    if ($scope.audio_mutu && $scope.audio_fondo.playing)
      $scope.audio_fondo_stop ();
    else if (!$scope.audio_mutu)
      $scope.audio_fondo_play (audio_fondo);
    
  };
  
  document.addEventListener ('deviceready', function (){
    
    $scope.init ();
    
  });
  
}]);