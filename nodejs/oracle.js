var oracledb = require('oracledb');
var appRoot = require('app-root-path').path;
var dbConfig = require(appRoot + '/config/dbConfig');
var sync = require('./sync.js')

let sqltext = `SELECT FILEPATH,ORIGINFILENAME FROM TBL_OCR_FILE WHERE IMGID IN (`;

exports.selectOcrFilePaths = function (req, done) {
  return new Promise(async function(resolve, reject) {
    let conn;
  
    try {
      conn = await oracledb.getConnection(dbConfig);
      let result = await conn.execute(`SELECT SEQNUM,FILEPATH,ORIGINFILENAME FROM TBL_OCR_FILE WHERE IMGID IN (${req.map((name, index) => `:${index}`).join(", ")})`, req)

      //resolve(result.rows);
      return done(null, result.rows);
    } catch (err) { // catches errors in getConnection and the query
      reject(err);
    } finally {
      if (conn) {   // the conn assignment worked, must release
        try {
          await conn.release();
        } catch (e) {
          console.error(e);
        }
      }
    }
  });
}


