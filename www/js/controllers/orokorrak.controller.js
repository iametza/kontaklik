app.controller ('OrokorraCtrl', ['$scope', '$cordovaNativeAudio', function ($scope, $cordovaNativeAudio){
  
  $scope.audioak = [];
  $scope.audio_fondo = {'izena': '', 'playing': false};
  
  $scope.init = function (){
    
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
    
  };
  
  $scope.audio_play = function (audio){
    
    if ($scope.audioak.indexOf (audio) >= 0)
      $cordovaNativeAudio.play (audio);
    
  };
  
  $scope.audio_stop = function (audio){
    
    if ($scope.audioak.indexOf (audio) >= 0)
      $cordovaNativeAudio.stop (audio);
    
  };
  
  $scope.audio_fondo_play = function (audio){
    
    if ($scope.audioak.indexOf (audio) >= 0){
      
      if (!$scope.audio_fondo.playing){
        
        $scope.audio_fondo.izena = audio;
        $scope.audio_fondo.playing = true;
        
        $cordovaNativeAudio.loop (audio);
        
      }
      else if ($scope.audio_fondo.izena != audio){
        
        $cordovaNativeAudio.stop ($scope.audio_fondo.izena);
        
        $scope.audio_fondo.izena = audio;
        $scope.audio_fondo.playing = true;
        
        $cordovaNativeAudio.loop (audio);
        
      }
      
    }
    
  };
  
  $scope.audio_fondo_stop = function (audio){
    
    if ($scope.audioak.indexOf (audio) >= 0 && $scope.audio_fondo.playing){
      
      $scope.audio_fondo.izena = '';
      $scope.audio_fondo.playing = false;
      
      $cordovaNativeAudio.stop (audio);
      
    }
    
  };
  
  document.addEventListener ('deviceready', function (){
    
    $scope.init ();
    
  });
  
}]);