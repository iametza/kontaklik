app.factory('Database', ['$cordovaSQLite', '$q', function($cordovaSQLite, $q){
  
  var Database = {}, db = undefined;
  
  var init = function (){
    
    document.addEventListener ('deviceready', function (){
      
      if ($cordovaSQLite !== undefined){
        db = $cordovaSQLite.openDB ({ name: 'kontaklik.db', iosDatabaseLocation: 'Library', bgType: 1 });
      }
      else{
        init ();
      }
      
    });
    
  };
  
  Database.getDatabase = function (){
    
    if (db === undefined) init ();
    
    return db;
  
  };
  
  Database.createTables = function (){
    var d = $q.defer();
    
    var query_files = "CREATE TABLE IF NOT EXISTS `irudiak` (" +
      "`id` INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "`path` TEXT NOT NULL," +
      "`atala` TEXT NOT NULL," + // objektua edo fondoa
      "`fk_ipuina` INTEGER NOT NULL," +
      "`timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP);" +
      "CREATE INDEX fk_ipuina ON irudiak (fk_ipuina);";
      
    var query_erabiltzaileak = "CREATE TABLE IF NOT EXISTS `erabiltzaileak` (" +
      "`id` INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "`izena` TEXT NOT NULL," +
      "`timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP);";
      
    var query_ipuinak = "CREATE TABLE IF NOT EXISTS `ipuinak` (" +
      "`id` INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "`izenburua` TEXT NOT NULL," +
      "`fk_erabiltzailea` INTEGER NOT NULL," +
      "`timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP);" +
      "CREATE INDEX fk_erabiltzailea ON ipuinak (fk_erabiltzailea);";
      
    var query_eszenak = "CREATE TABLE IF NOT EXISTS `eszenak` (" +
      "`id` INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "`fk_ipuina` INTEGER NOT NULL," +
      "`fk_fondoa` INTEGER NOT NULL," +
      "`timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP);" +
      "CREATE INDEX fk_ipuina ON eszenak (fk_ipuina);";
                
    document.addEventListener ('deviceready', function (){
      
      if (db === undefined) init ();
      
      $cordovaSQLite.execute (db, query_files, []).then (function (){
        $cordovaSQLite.execute (db, query_erabiltzaileak, []).then (function (){
          $cordovaSQLite.execute (db, query_ipuinak, []).then (function (){
            $cordovaSQLite.execute (db, query_eszenak, []).then (function (){
              d.resolve ();
            }, function (err) { d.reject (err); });
          }, function (err) { d.reject (err); });
        }, function (err) { d.reject (err); });
      }, function (err) { d.reject (err); });
        
    });
    
    return d.promise;
  };
  
  Database.query = function (query, params=[]){
    var d = $q.defer ();
    var emaitza = [];
    
    $cordovaSQLite.execute (db, query, params).then (function (res){
      
      for (i=0; i < res.rows.length; i++)
        emaitza.push (res.rows.item (i));
        
      d.resolve (emaitza);
      
    }, function (err){
      d.reject (err);
    });
    
    return d.promise;
  };
  
  Database.getRows = function (table, args, extra){
    var d = $q.defer ();
    
    if (table !== ''){
      var query = 'SELECT * FROM ' + table + ' WHERE 1';
      var values = [];
      
      Object.keys (args).forEach (function (key){
        query = query + ' AND ' + key + " = ?";
        values.push (args[key]);
      });
      
      if (extra !== undefined && extra !== ''){
        query = query + extra;
      }
      
      document.addEventListener ('deviceready', function (){
        
        if(db === undefined) init ();
        
        $cordovaSQLite.execute (db, query, values).then (function (res){
          var elementos = [];
          
          if (res.rows.length > 0){
            for (var i=0; i<res.rows.length; i++){
              elementos.push(res.rows.item(i));
            }
          }
          
          d.resolve (elementos);
        }, function (err) { d.reject (err); });
        
      });
    }
    else{
      d.reject ('Taula hutsa');
    }
    
    return d.promise;
  };
  
  Database.insertRow = function (table, args){
    var d = $q.defer ();
    var keys = [] , values= [], galderak = [];
    var query = 'INSERT INTO ' + table;
    
    Object.keys (args).forEach (function (key){
      keys.push (key);
      galderak.push ('?');
      values.push (args[key]);
    });
    
    query = query + '(' + keys.join (',') + ') values ('+ galderak.join (',') +')';
    
    document.addEventListener ('deviceready', function (){
      
      if (db === undefined) init ();
      
      $cordovaSQLite.execute (db, query, values).then (function (res) { d.resolve (res); }, function (err){ d.reject (err); });
      
    });
    
    return d.promise;
  };
  
  Database.deleteRows = function (table, args){
    var d = $q.defer ();
    
    if (table !== ''){
      var query = 'DELETE FROM ' + table + ' WHERE 1';
      var values = [];
      
      Object.keys (args).forEach (function (key){
        query = query + ' AND ' + key + " = ?";
        values.push (args[key]);
      });
      
      document.addEventListener ('deviceready', function (){
        if (db === undefined) init ();
        
        $cordovaSQLite.execute (db, query, values).then (function (res){
          
          d.resolve (res);
          
        }, function (err){ d.reject (err); });
        
      });
    }
    else{
      d.reject ('Taula hutsa');
    }
    
    return d.promise;
  };

  Database.dropTables = function (){
    var d = $q.defer ();
    var query = "DROP TABLES";
    
    document.addEventListener ('deviceready', function (){
      
      if(db === undefined) init ();
      
      $cordovaSQLite.execute (db, query, []).then (function (res){
        
        d.resolve (res);
      
      }, function (err){ d.reject (err); });
      
    });
    
    return d.promise;
  }; 
  
  return Database;

}]);