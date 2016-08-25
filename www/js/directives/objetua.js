app.directive('objetua',['$cordovaDialogs', function ($cordovaDialogs) {
  return {
    restrict : 'AE',
    scope: {},
    template : '<div class="laukia" hm-rotate="onRotate($event)" hm-rotateend="onRotateEnd()" hm-rotatestart="onRotateStart($event)" hm-pinchend="onPinchEnd()" hm-pinch="onPinch($event)" hm-panmove="onPan($event)" hm-press="onPress($event)"></div>',
    link : function (scope, element, attrs) {
      var elementWidth = 75,
          elementHeight = 225,
          transform = {  translate :{ x: attrs.x, y: attrs.y   }, scale: 1, angle: 0, rx: 0, ry: 0, rz: 0 },
          initScale = 1,
          initAngle = 0,
          rotationInit = 0;
      
      element.children().css({ 'background-image': 'url('+attrs.background+')',
                                transform: 'translate3d(' + attrs.x + 'px, ' + attrs.y + 'px, 0)'});
      var updateElementTransform = function() {
        var value = 'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0) '+
                    'scale(' + transform.scale + ', ' + transform.scale + ') ' +
                    'rotate('+  transform.angle + 'deg)'
        var css = { 'transform': value, '-webkit-transform': value, '-moz-transform': value, '-o-transform': value };               
         element.children().css(css);        
      };
      scope.onPress = function onPress(event) {
       $cordovaDialogs.confirm('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then(function(buttonIndex){
        if (buttonIndex == 1) {
          element.remove();
        }
       }, function(err){
        
       });
      };
      scope.onRotateEnd = function onRotateEnd() {        
        initAngle = transform.angle;
      };
      scope.onRotateStart = function onRotateEnd(event) {        
        rotationInit = event.rotation;
      };
      scope.onRotate = function onRotate (event) {        
        if (event.target === element[0].children[0]) {
          transform.angle = initAngle + (event.rotation - rotationInit);
          transform.rz = 1;
          updateElementTransform();
        }
      };
      scope.onPinchEnd = function onPinchEnd(){       
        initScale = transform.scale;
      };
      scope.onPinch = function onPinch (event) {        
        if (event.target === element[0].children[0]) {                   
          transform.scale = initScale * event.scale;      
          updateElementTransform();
        }
      };
      scope.onPan = function onPan (event) {        
        if (event.target === element[0].children[0]) {
          transform.translate.x = event.center.x - elementWidth;
          transform.translate.y = event.center.y - elementHeight;          
          updateElementTransform();
        }
      };
    }
  }
}]);