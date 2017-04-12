app.filter('kontador', function() {

  return function(segunduak) {

    // Comprobamos que segunduak es un número positivo
    if (isNaN(segunduak) || segunduak < 0) {

      return '00:00';

    } else {

      var mins = Math.floor(segunduak / 60);
      var secs = segunduak - mins * 60;

      return (str_pad_left(mins, '0', 2) + ':' + str_pad_left(secs, '0', 2));

    }

  };

  function str_pad_left(string, pad, length) {

    return (new Array(length + 1).join(pad) + string).slice(-length);

  }

});
