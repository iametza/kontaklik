app.controller('EditoreaCtrl', ['$scope', function($scope) {
  //https://stackoverflow.com/questions/29273808/how-to-crop-a-polynomial-shape-from-an-image
  var canvas,
      ctx,
      srcImage,
      col12 = angular.element('.col-md-12'),
      eszenatokia = angular.element('#eszenatokia'),
      moztuBotoia = angular.element('#moztu')
      garbituBotoia = angular.element('#garbitu')
      gordeBotoia = angular.element('#gorde')
      ezabatuBotoia = angular.element('#ezabatu'),
      canvasElement = angular.element('#canvas');
  ezabatuBotoia.hide();
  gordeBotoia.hide();
  eszenatokia.css('background', "none");
  eszenatokia.css('padding', "0");
  col12.css('padding', "0");
  document.addEventListener("deviceready", function() {
    srcImage = new Image(); // create image object
    srcImage.src = "assets/fondoak/baserria.png";
    srcImage.onload = loadImage;

    canvas = document.getElementById('canvas');
    canvas.width = document.body.clientWidth; //document.width is obsolete
    canvas.height = document.body.clientHeight; //document.height is obsolete

    ctx = canvas.getContext('2d');
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#222222";
    ctx.lineWith = 2;

    canvas.addEventListener('touchstart', handleStart, false);
    canvas.addEventListener('touchend', handleEnd, false);
    canvas.addEventListener('touchmove', handleMove, false);


  }, false);
  $scope.atzera = function() {
    window.history.back();
  };
  $scope.garbitu = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allTouches = new Array;
    loadImage();
  };
  $scope.ezabatu = function() {
    ezabatuBotoia.hide();
    gordeBotoia.hide();
    garbituBotoia.show();
    moztuBotoia.show();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allTouches = new Array;
    loadImage();
    angular.element('.irudi_moztua').remove();
    canvasElement.show();
  };
  $scope.moztu = function() {
    ezabatuBotoia.show();
    gordeBotoia.show();
    garbituBotoia.hide();
    moztuBotoia.hide();

    if(allTouches.length > 0) {
      var img = new Image(); // create image object
      img.src = "assets/fondoak/baserria.png";
      img.onload = crop;
    } else {
      alert('Moztu baino lehenago zati bat aukeratu');
    }
  };

  var ongoingTouches = new Array;
  var allTouches = new Array;
  function loadImage() {
    ctx.drawImage(srcImage, 0, 0,  canvas.width, canvas.height);
  };
  function crop() {
    // do the cropping, provide callback
    cropImage(srcImage, allTouches, function(img) {
      // img is the cropped image - add to DOM for demo
      canvasElement.hide();
      //ctx.drawImage(img, 0, 0);
      col12.append('<img src="'+img.src+'" class="irudi_moztua" />');
    })
  };

  function colorForTouch(touch) {
    var id = touch.identifier;
    id = id.toString(16); // make it a hex digit
    return "#" + id + id + id;
  }

  function ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < ongoingTouches.length; i++) {
      var id = ongoingTouches[i].identifier;

      if (id == idToFind) {
        return i;
      }
    }
    return -1; // not found
  }

  function handleStart(evt) {
    evt.preventDefault();
    allTouches = new Array;
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
      ongoingTouches.push(touches[i]);
      allTouches.push({ x: touches[i].pageX, y: touches[i].pageY });

      var color = colorForTouch(touches[i]);
      ctx.fillStyle = color;
      ctx.fillRect(touches[i].pageX - 2, touches[i].pageY - 2, 4, 4);
    }
  }

  function handleMove(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;
    ctx.lineWidth = 4;

    for (var i = 0; i < touches.length; i++) {
      var color = colorForTouch(touches[i]);
      var idx = ongoingTouchIndexById(touches[i].identifier);
      allTouches.push({ x: touches[i].pageX, y: touches[i].pageY });
      ctx.fillStyle = color;
      ctx.beginPath();
      if(ongoingTouches[idx] != undefined) {
        ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
      }
      ctx.lineTo(touches[i].pageX, touches[i].pageY);
      ctx.closePath();
      ctx.stroke();
      ongoingTouches.splice(idx, 1, touches[i]); // swap in the new touch record
    }
  }

  function handleEnd(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;

    ctx.lineWidth = 4;

    for (var i = 0; i < touches.length; i++) {
      var color = colorForTouch(touches[i]);
      var idx = ongoingTouchIndexById(touches[i].identifier);

      ctx.fongoingTouchesillStyle = color;
      ctx.beginPath();
      ctx.moveTo(ongoingTouches[i].pageX, ongoingTouches[i].pageY);
      ctx.lineTo(touches[i].pageX, touches[i].pageY);
      ongoingTouches.splice(i, 1); // remove it; we're done
    }
  }

  function handleCancel(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
      ongoingTouches.splice(i, 1); // remove it; we're done
    }
  };


  function cropImage(image, arr, callback) {
    // create a canvas element, and get 2D context for it:
    // create a canvas element, and get 2D context for it:
var canvas2 = document.createElement("canvas"),
    ctx = canvas2.getContext("2d"),
    i, minx = 10000, miny = 10000, maxx = -1, maxy = -1;

    // find min max of array points here:
    for (i = 0; i < arr.length; i++) {
      if (arr[i].x < minx) minx = arr[i].x;
      if (arr[i].x > maxx) maxx = arr[i].x;
      if (arr[i].y < miny) miny = arr[i].y;
      if (arr[i].y > maxy) maxy = arr[i].y;
    }

    // set proper size:
    canvas2.width = maxx - minx;
    canvas2.height = maxy - miny;

    // translate context so corner of clip is (0,0)
    ctx.translate(-minx, -miny);

    // draw in image;
    ctx.drawImage(image, 0, 0,  canvas.width, canvas.height);

    // create a clip path:
    ctx.moveTo(arr[0].x, arr[0].y);
    for (i = 1; i < arr.length; i++) ctx.lineTo(arr[i].x, arr[i].y);

    // set comp. mode so image within path is kept:
    ctx.globalCompositeOperation = "destination-atop";
    ctx.fill();

    // done, create an image object:
    var dstImage = new Image();
    dstImage.onload = function() {
      callback(this)
    };
    dstImage.src = canvas2.toDataURL(); // saves PNG in this case as data-uri
  }

}]);
