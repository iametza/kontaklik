app.controller('EditoreaCtrl', function() {
  //https://stackoverflow.com/questions/29273808/how-to-crop-a-polynomial-shape-from-an-image
  var canvas, context, srcImage;
  angular.element('#eszenatokia').css('background', "none");
  document.addEventListener("deviceready", function() {
    canvas = document.getElementById('canvas');
    canvas.width = document.body.clientWidth -20; //document.width is obsolete
    canvas.height = document.body.clientHeight -20; //document.height is obsolete

    ctx = canvas.getContext('2d');
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#222222";
    ctx.lineWith = 2;

    canvas.addEventListener('touchstart', handleStart, false);
    canvas.addEventListener('touchend', handleEnd, false);
    canvas.addEventListener('touchmove', handleMove, false);

    srcImage = new Image(); // create image object
    srcImage.onload = crop; // set callback
    srcImage.src = "assets/fondoak/baserria.png";
  }, false);
  var ongoingTouches = new Array;

  function crop() {
    // - image is loaded and is represented as "this" inside this callback

    // some "random" points for demo
    var arr = [{
      x: 10,
      y: 90
    }, {
      x: 70,
      y: 10
    }, {
      x: 400,
      y: 200
    }, {
      x: 200,
      y: 220
    }];

    // do the cropping, provide callback
    cropImage(this, arr, function(img) {
      // img is the cropped image - add to DOM for demo
      context.drawImage(img, 69, 50);
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
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
      ongoingTouches.push(touches[i]);
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

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
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

      ctx.fillStyle = color;
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
    var i, minx = 10000,
      miny = 10000,
      maxx = -1,
      maxy = -1;

    // find min max of array points here:
    for (i = 0; i < arr.length; i++) {
      if (arr[i].x < minx) minx = arr[i].x;
      if (arr[i].x > maxx) maxx = arr[i].x;
      if (arr[i].y < miny) miny = arr[i].y;
      if (arr[i].y > maxy) maxy = arr[i].y;
    }

    // set proper size:
    canvas.width = maxx - minx;
    canvas.height = maxy - miny;

    // translate context so corner of clip is (0,0)
    ctx.translate(-minx, -miny);

    // draw in image;
    ctx.drawImage(image, 0, 0);

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
    dstImage.src = canvas.toDataURL(); // saves PNG in this case as data-uri
  }

});
