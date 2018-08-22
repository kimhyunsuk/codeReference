var fs = require('fs'),
    readline = require('readline'),
    stream = require('stream');
var oracledb = require('oracledb');
var appRoot = require('app-root-path').path;
var dbConfig = require(appRoot + '/config/dbConfig');
oracledb.autoCommit = true;

var instream = fs.createReadStream('./sampleData/largedata.txt');
var outstream = new stream;
outstream.readable = true;
outstream.writable = true;

var rl = readline.createInterface({
    input: instream,
    output: outstream,
    terminal: false
});



oracledb.getConnection(dbConfig,
    function (err, connection) {

        if (err) {
            console.error(err.message);
            return;
        }
        rl.on('line', function (line) {
            var arr = line.split('\t')

            console.log(arr[0]);
            if (isNaN(arr[0])) {
                rl.write(
                    connection.execute(
                    "insert into TBL_TEST VALUES(:CODE)"
                    , [arr[0]]
                    ,
                    function (err) {
                        if (err) {
                            console.log(err.message);
                            return;
                        }
                        connection.commit(function (err) {
                            if (err) {
                                console.log(err.message);
                                return;
                            }
                        })
                    })
                );
            }
            //Do your stuff ...
            //Then write to outstream
            
        });


    });
