app.factory('Database', ['$cordovaSQLite', '$q', function($cordovaSQLite, $q){
  var Database = {},
      db = undefined;
  var init = function(){
    document.addEventListener('deviceready', function() {
      if ($cordovaSQLite !== undefined) {
        db = $cordovaSQLite.openDB({ name: 'haziak.db', iosDatabaseLocation: 'Library', bgType: 1 });
      } else {
        init();
      }
    });
  };
  Database.getDatabase = function(){
     if(db == undefined) init();
     return db;
  }
  Database.createTables = function() {
    var d = $q.defer();
    var query_files = "CREATE TABLE IF NOT EXISTS `files` (" +
                "`id` INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "`izena` TEXT NOT NULL," +
                "`path` TEXT NOT NULL," +
                "`atala` TEXT NOT NULL," +
                "`mota` TEXT NOT NULL," +
                "`timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
     var query_erabiltzaileak = "CREATE TABLE IF NOT EXISTS `erabiltzaileak` (" +
                "`id` INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "`izena` TEXT NOT NULL," +                
                "`timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
    var query_ipuinak = "CREATE TABLE IF NOT EXISTS `erabiltzaileak` (" +
                "`id` INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "`izena` TEXT NOT NULL," +                
                "`timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
    document.addEventListener('deviceready', function() {
      if(db == undefined) init();
      $cordovaSQLite.execute(db, query_files, []).then( function(res) {
        $cordovaSQLite.execute(db, query_erabiltzaileak, []).then( function(res) {
          $cordovaSQLite.execute(db, query_ipuinak, []).then( function(res) {
            d.resolve();
          }, function(err) { d.reject(err); });
        }, function(err) { d.reject(err); });
      }, function(err) { d.reject(err); });
    }, false);
    return d.promise;
  };
  Database.saveFile = function(name, mota, atala) {
    var d = $q.defer();
    var query = 'INSERT INTO files(izena, path, atala, mota) VALUES(?, ?, ?, ?)';
    document.addEventListener('deviceready', function() {
      if(db == undefined) init();
      $cordovaSQLite.execute(db, query, [name.split('/').pop(), name, atala, mota]).then( function(res) {
        d.resolve({ path: name, id: res.insertedId });
      }, function(err) { d.reject(err); });
    }, false);
    return d.promise;    
  };
  Database.getFiles = function(mota) {
    var d = $q.defer();
    var query = 'SELECT * FROM files WHERE atala = ?';
    document.addEventListener('deviceready', function() {
      if(db == undefined) init();
      $cordovaSQLite.execute(db, query, [mota]).then( function(res) {
        var files = [];
        if (res.rows.length > 0) {
           for(var i=0; i<res.rows.length; i++){            
              files.push(res.rows.item(i));      
           }
        }
        d.resolve(files);
      }, function(err) { d.reject(err); });
    }, false);
    return d.promise;    
  };

  Database.dropTables = function(){
    var d = $q.defer();
    var query = 'DROP TABLE files';
    document.addEventListener('deviceready', function() {
      if(db == undefined) init();
      $cordovaSQLite.execute(db, query, []).then( function(res) {
        d.resolve();
      }, function(err) { d.reject(err); });
    }, false);
    return d.promise;
  };
  return Database;
}]);