var createTree = require('dirtree');
var oracledb = require('oracledb');
var SimpleOracleDB = require('simple-oracledb');
SimpleOracleDB.extend(oracledb);
var appRoot = require('app-root-path').path;
var dbConfig = require(appRoot + '/config/dbConfig');
oracledb.autoCommit = true;
var tree = createTree();
tree.root('C://tmp//1')
    .exclude('dirs', /^\./)
    .exclude('files', /^\./)
    .create();

oracledb.getConnection(dbConfig,
    function (err, connection) {

        if (err) {
            console.error(err.message);
            return;
        }
        var insertArr = []
        let temp = '';
        for(var i = 0; i < 2000000; ++i) {
            insertArr.push({ id: '/' + i + '/', data: i + '.TIF' })
            //console.log(insertArr.length + '' + fullpath);
            if (insertArr.length > 50000) {
                console.log(i + '');
                connection.batchInsert(
                    "insert into TBL_BATCH_LEARN_DATA(FILEPATH, FILENAME) VALUES(:id, :data)"
                    , insertArr
                    , {autoCommit: true}
                    , function onResults(error, output) {
                        //continue flow...
                        console.log(output);
                    }
                );
                insertArr = [];
            }
        }
        connection.batchInsert(
            "insert into TBL_TEST_STR(ID, DATAS) VALUES(:id, :data)"
            , insertArr
            , {autoCommit: true}
            , function onResults(error, output) {
                console.log(output);
            }
        );
    });






    // oracledb.getConnection(dbConfig,
    //     function (err, connection) {
    
    //         if (err) {
    //             console.error(err.message);
    //             return;
    //         }
    //         var insertArr = []
    //         let temp = '';
    //         for (fullpath in tree.leaves()) {
    //             temp = tree.leaves()[fullpath];
    //             insertArr.push({ id: temp.substring(0, temp.lastIndexOf('/') + 1), data: temp.substring(temp.lastIndexOf('/') + 1) })
    //             console.log(insertArr.length + '' + fullpath);
    //             if (insertArr.length > 1) {
    //                 connection.batchInsert(
    //                     "insert into TBL_BATCH_LEARN_DATA(FILENAME, FILEPATH) VALUES(:id, :data)"
    //                     , insertArr
    //                     , {autoCommit: true}
    //                     , function onResults(error, output) {
    //                         //continue flow...
    //                     }
    //                 );
    //                 insertArr = [];
    //             }
    //         }
    //         connection.batchInsert(
    //             "insert into TBL_TEST_STR(ID, DATAS) VALUES(:id, :data)"
    //             , insertArr
    //             , {autoCommit: true}
    //             , function onResults(error, output) {
    //                 //continue flow...
    //             }
    //         );
    //     });
    
    
    