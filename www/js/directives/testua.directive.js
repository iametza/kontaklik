app.directive ('testua', ['$cordovaDialogs', 'Database', 'Funtzioak', function ($cordovaDialogs, Database, Funtzioak){
  
  return {
    restrict: 'AE',
    scope: {},
    template : '<div hm-panmove="onPan" hm-press="onPress" hm-rotate="onRotate($event)" hm-rotateend="onRotateEnd()" hm-rotatestart="onRotateStart($event)">hola!<br />kaixo!</div>',
    link: function (scope, element, attrs){
      var initScale = attrs.scale !== undefined ? attrs.scale : 1,
          initAngle = attrs.rotate !== undefined ? attrs.rotate : 0,
          rotationInit = 0,
          transform = {  translate :{ x: attrs.x, y: attrs.y   }, scale: initScale, angle: initAngle, rx: 0, ry: 0, rz: 0 },
          elementWidth = 75,
          elementHeight = 75;
          
      if (attrs.edukia !== undefined)
        element.children ().html (Funtzioak.nl2br (attrs.edukia));
      
      if (attrs.scale === undefined)
        element.children ().css ({ transform: 'translate3d(' + attrs.x + 'px, ' + attrs.y + 'px, 0)'});
      
      var updateElementTransform = function (){
        var value = 'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0) ' +
                    'scale(' + transform.scale + ', ' + transform.scale + ') ' +
                    'rotate('+  transform.angle + 'deg)';
        var css = { 'transform': value, '-webkit-transform': value, '-moz-transform': value, '-o-transform': value };
        
        element.children ().css (css);
      };
      
      scope.onPress = function onPress (){
        
        $cordovaDialogs.confirm ('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then (function (buttonIndex){
          
          if (buttonIndex == 1){
            
            if (element.attr ('data-testua-id') !== undefined){
              
              Database.query ('DELETE FROM testuak WHERE id=?', [parseInt (element.attr ('data-testua-id'))]).then (function (){
                
                element.remove();
                
              }, function (error){
                console.log ("Testua directive DELETE", error);
              });
              
            }
            
          }
          
        }, function (error){
          console.log ("Objektua directive onPress", error);
        });
        
      };
      
      scope.onRotateEnd = function onRotateEnd (){
        
        initAngle = transform.angle;
        
      };
      
      scope.onRotateStart = function onRotateEnd (event){
        
        rotationInit = event.rotation;
        
      };
      
      scope.onRotate = function onRotate (event){
        
        if (event.target === element[0].children[0]){
          transform.angle = parseFloat (initAngle) + parseFloat (event.rotation - rotationInit);
          transform.rz = 1;
          updateElementTransform ();
        }
        
      };
      
      scope.onPan = function onPan (event){
        
        if (event.target === element[0].children[0]){
          transform.translate.x = event.center.x - elementWidth;
          transform.translate.y = event.center.y - elementHeight;
          updateElementTransform ();
        }
        
      };
      
    } // link
    
  }; // return
  
}]);