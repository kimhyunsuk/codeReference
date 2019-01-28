var oracledb = require('oracledb');
var appRoot = require('app-root-path').path;
var sync = require('./sync.js')
var execSync = require('child_process').execSync;
var fs = require('fs');
var propertiesConfig = require(appRoot + '/config/propertiesConfig.js');
var request = require('request');
var request = require('sync-request');

let sqltext = `SELECT FILEPATH,ORIGINFILENAME FROM TBL_OCR_FILE WHERE IMGID IN (`;

var dbConfig = {
  user: process.env.NODE_ORACLEDB_USER || "koreanre",
  password: process.env.NODE_ORACLEDB_PASSWORD || "koreanre01",
  connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING || "172.16.53.142/koreanreocr",
  externalAuth: process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false,
  poolMax: 30,
  poolMin: 10
};

exports.selectDomainDict = function (req, done) {
  return new Promise(async function (resolve, reject) {
    var conn;
    let returnObj = null;
    let selectContractMapping = `SELECT asOgcompanyName legacy FROM tbl_contract_mapping WHERE extOgcompanyName = :extOgcompanyName`;
    try {
      conn = await oracledb.getConnection(dbConfig);
      let result = await conn.execute(selectContractMapping, req,{outFormat: oracledb.OBJECT},);
      if (result.rows[0] != null) {
        returnObj = result.rows[0].LEGACY;
      } else {
        returnObj = null;
      }

      return done(null, returnObj);
    } catch (err) {
      reject(err);
    } finally {
      if (conn) {
        try {
          await conn.release();
        } catch (e) {
          console.error(e);
        }
      }
    }
  });
};

exports.selectSid = function (req, done) {
  return new Promise(async function (resolve, reject) {
    let conn;

    try {
      conn = await oracledb.getConnection(dbConfig);
      let sqltext = `SELECT EXPORT_SENTENCE_SID(:COND) SID FROM DUAL`;
      var sid = "";
      locSplit = req.location.split(",");
      //need check
      sid += locSplit[0] + "," + locSplit[1] + "," + (Number(locSplit[0]) + Number(locSplit[2]));

      let result = await conn.execute(sqltext, [req.text]);

      if (result.rows[0] != null) {
        sid += "," + result.rows[0].SID;
      }
      return done(null, sid);
    } catch (err) {
      reject(err);
    } finally {
      if (conn) {
        try {
          await conn.release();
        } catch (e) {
          console.error(e);
        }
      }
    }
  });
};

exports.insertContractMapping = function (req, done) {
  return new Promise(async function (resolve, reject) {
      let conn;
      let result;

      try {
          conn = await oracledb.getConnection(dbConfig);
          result = await conn.execute(queryConfig.uiLearningConfig.insertContractMapping2, [req[0], req[1], req[2], req[3]]);

          return done(null, null);
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
};
exports.insertOcrSymsSingle = function (req, done) {
  return new Promise(async function (resolve, reject) {
    let conn;
    try {
      let selectTypo = `SELECT seqNum FROM tbl_ocr_symspell WHERE keyword=:keyWord `;
      let insertTypo = `INSERT INTO tbl_ocr_symspell(seqNum, keyword, frequency) VALUES (seq_ocr_symspell.nextval, :keyWord, 1)`;
      conn = await oracledb.getConnection(dbConfig);
      var reqArr = req.text.split(' ');
      var result;
      for (var i in reqArr) {
        result = await conn.execute(selectTypo, [reqArr[i]]);
        if (result.rows.length == 0) {
          result = await conn.execute(insertTypo, [reqArr[i]]);
        } else {
          //result = await conn.execute(queryConfig.uiLearningConfig.updateTypo, [reqArr[i]]);
        }
      }

      return done(null, null);
    } catch (err) { // catches errors in getConnection and the query
      console.log(err);
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
};

exports.insertColumnMapping = function (req, done) {
  return new Promise(async function (resolve, reject) {
      let conn;
      try {
          conn = await oracledb.getConnection(dbConfig);
          let selectSqlText = `SELECT SEQNUM FROM TBL_COLUMN_MAPPING_TRAIN WHERE DATA = :DATA AND CLASS = :CLASS`;
          let insertSqlText = `INSERT INTO TBL_COLUMN_MAPPING_TRAIN (SEQNUM, DATA, CLASS, REGDATE) VALUES (SEQ_COLUMN_MAPPING_TRAIN.NEXTVAL,:DATA,:CLASS,SYSDATE)`;
          let updateSqlText = `UPDATE TBL_COLUMN_MAPPING_TRAIN SET DATA = :DATA, CLASS = :CALSS, REGDATE = SYSDATE WHERE SEQNUM = :SEQNUM`;

          for (var i in req.data) {
              var result = await conn.execute(selectSqlText, [req.data[i].sid, req.data[i].colLbl]);
              if (result.rows[0]) {
                  //await conn.execute(updateSqlText, [req.data[i].sid, req.data[i].colLbl, result.rows[0].SEQNUM]);
              } else {
                  await conn.execute(insertSqlText, [req.data[i].sid, req.data[i].colLbl]);
              }
                  
          }
          return done(null, req);
      } catch (err) {
          reject(err);
      } finally {
          if (conn) {
              try {
                  await conn.release();
              } catch (e) {
                  console.error(e);
              }
          }
      }
  });
};

exports.selectLegacyFileData = function (req, done) {
  return new Promise(async function (resolve, reject) {
    var res = [];
    let conn;
    try {
      conn = await oracledb.getConnection(dbConfig);
      let resAnswerFile = await conn.execute(`SELECT * FROM TBL_BATCH_ANSWER_FILE WHERE IMGID LIKE :term`, [req]);

      

      for (let row in resAnswerFile.rows) {
        tempDictFile = {};
        tempDictFile['IMGID'] = resAnswerFile.rows[row][0];
        tempDictFile['PAGENUM'] = resAnswerFile.rows[row][1];
        tempDictFile['FILEPATH'] = resAnswerFile.rows[row][2];
        tempDictFile['FILENAME'] = tempDictFile['FILEPATH'].substring(tempDictFile['FILEPATH'].lastIndexOf('/') + 1, tempDictFile['FILEPATH'].length);

        let answerDataArr = await conn.execute(`SELECT * FROM TBL_BATCH_ANSWER_DATA WHERE IMGID = :imgId AND TO_NUMBER(IMGFILESTARTNO)\
         <= :imgStartNo AND TO_NUMBER(IMGFILESTARTNO) <= :imgStartNo`, [tempDictFile['IMGID'], tempDictFile['PAGENUM'], tempDictFile['PAGENUM']]);
        
        for (let row2 in answerDataArr.rows) {
          let tempdict = {};
          for (let i = 0; i < answerDataArr.metaData.length; i++) {
            tempdict[answerDataArr.metaData[i].name] = answerDataArr.rows[row2][i];
          }
          tempDictFile['LEGACY'] = tempdict;
        }
        res.push(tempDictFile);
      }
      return done(null, res);
    } catch (err) { // catches errors in getConnection and the query
      console.log(err);
      return done(null, null);
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
};

exports.selectOcrFilePaths = function (req, done) {
  return new Promise(async function (resolve, reject) {
    var res = [];
    let conn;
    let colNameArr = ['SEQNUM', 'FILEPATH', 'ORIGINFILENAME'];
    try {
      conn = await oracledb.getConnection(dbConfig);
      let result = await conn.execute(`SELECT SEQNUM,FILEPATH,ORIGINFILENAME FROM TBL_OCR_FILE WHERE IMGID IN (${req.map((name, index) => `:${index}`).join(", ")})`, req)

      for (var row = 0; row < result.rows.length; row++) {
        var dict = {};
        for (var colName = 0; colName < colNameArr.length; colName++) {
          dict[colNameArr[colName]] = result.rows[row][colName];
        }
        res.push(dict);
      }

      //resolve(result.rows);
      return done(null, res);
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

exports.convertTiftoJpg = function (originFilePath, done) {
  try {
    //출력파일은 서버의 절대 경로 c/ImageTemp/오늘날짜/originFile명 으로 저장
    convertedFileName = originFilePath.split('.')[0] + '.jpg';
    execSync('module\\imageMagick\\convert.exe -density 200 -sharpen 0x3.0 -colorspace GRAY ' + originFilePath + ' ' + convertedFileName);
    return done(null, convertedFileName);

    
  } catch (err) {
    console.log(err);
  } finally {
    //console.log('end');
  }
}

exports.insertOcrSymsDoc = function (req, done) {
  return new Promise(async function (resolve, reject) {
      let conn;
      try {
          let selectTypo = `SELECT seqNum FROM tbl_ocr_symspell WHERE keyword=LOWER(:keyWord) `;
          let insertTypo = `INSERT INTO tbl_ocr_symspell(seqNum, keyword, frequency) VALUES (seq_ocr_symspell.nextval, LOWER(:keyWord), 1)`;
          conn = await oracledb.getConnection(dbConfig);
          var reqArr = req.text.split(' ');
          var result;
          var numExp = /[0-9]/gi;
          var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
          for (var i in reqArr) {

              result = await conn.execute(selectTypo, [reqArr[i].replace(regExp, "")]);
              if (result.rows.length == 0) {
                  var exceptNum = reqArr[i].replace(numExp, "");

                  if (exceptNum != "") {
                      reqArr[i] = reqArr[i].replace(regExp, "");
                      exceptNum = reqArr[i].replace(numExp, "");
                      if (reqArr[i] != "" || exceptNum != "") {
                          result = await conn.execute(insertTypo, [reqArr[i]]);
                      }
                  }
              } else {
                  //result = await conn.execute(queryConfig.uiLearningConfig.updateTypo, [reqArr[i]]);
              }
          }

          return done(null, null);
      } catch (err) { // catches errors in getConnection and the query
          console.log(err);
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
};

exports.callApiOcr = function (req, done) {
  var pharsedOcrJson = "";
    try {
        var uploadImage = fs.readFileSync(req, 'binary');
        var base64 = new Buffer(uploadImage, 'binary').toString('base64');
        var binaryString = new Buffer(base64, 'base64').toString('binary');
        uploadImage = new Buffer(binaryString, "binary");

        var res = request('POST', propertiesConfig.ocr.uri, {
            headers: {
                'Ocp-Apim-Subscription-Key': propertiesConfig.ocr.subscriptionKey,
                'Content-Type': 'application/octet-stream'
            },
            uri: propertiesConfig.ocr.uri + '?' + 'language=ko&detectOrientation=true',
            body: uploadImage,
            method: 'POST'
        });
        var resJson = JSON.parse(res.getBody('utf8'));
        console.log(res.getBody('utf8'));
        pharsedOcrJson = ocrJson(resJson.regions);

        return done(null, pharsedOcrJson);
    } catch (err) {
        console.log(err);
        return done(null, 'error');
    } finally {

    }
}

function ocrJson(regions) {
  var data = [];
  for (var i = 0; i < regions.length; i++) {
      for (var j = 0; j < regions[i].lines.length; j++) {
          var item = '';
          for (var k = 0; k < regions[i].lines[j].words.length; k++) {
              item += regions[i].lines[j].words[k].text + ' ';
          }
          if (regions[i].lines[j].boundingBox.indexOf('362,1292')) {
            //console.log('check');
          }
          data.push({ 'location': regions[i].lines[j].boundingBox, 'text': item.trim().replace(/'/g, '`') });
      }
  }
  return data;
}

function phasingOcrJson(resJson) {
  var ocrDataArr = [];
  var ocrCount = 0;
  ocrCount++;
  if (!resJson.code) { // 에러가 아니면
    if (ocrCount == 1) {
      if (fileToPage.length > 0) {
        for (var i in fileToPage) {
          if (fileToPage[i].IMGID == answerRows.IMGID &&
            fileToPage[i].IMGFILESTARTNO <= answerRows.PAGENUM &&
            answerRows.PAGENUM <= fileToPage[i].IMGFILEENDNO) {
            ocrDataArr.push({
              answerImgId: answerRows.IMGID,
              fileInfo: [fileInfo],
              fileName: [fileName],
              regions: resJson.regions,
              fileToPage: fileToPage[i],
              lastYn: lastYn
            });
          }
        }
      } else {
        ocrDataArr.push({
          fileInfo: [fileInfo],
          fileName: [fileName],
          regions: resJson.regions,
          fileToPage: [],
          lastYn: lastYn
        });
      }
    } else {
      if (fileToPage.length > 0) {
        for (var i in ocrDataArr) {
          if (ocrDataArr[i].answerImgId == answerRows.IMGID &&
            ocrDataArr[i].fileToPage.IMGFILESTARTNO <= answerRows.PAGENUM &&
            answerRows.PAGENUM <= ocrDataArr[i].fileToPage.IMGFILEENDNO) {
            var totRegions = (ocrDataArr[i].regions).concat(data.regions);
            ocrDataArr[i].regions = totRegions;
            ocrDataArr[i].fileName.push(fileName);
            ocrDataArr[i].fileInfo.push(fileInfo);
            break;
          } else if (i == ocrDataArr.length - 1) {
            for (var j in fileToPage) {
              if (fileToPage[j].IMGID == answerRows.IMGID &&
                fileToPage[j].IMGFILESTARTNO <= answerRows.PAGENUM &&
                answerRows.PAGENUM <= fileToPage[j].IMGFILEENDNO) {
                ocrDataArr.push({
                  answerImgId: answerRows.IMGID,
                  fileInfo: [fileInfo],
                  fileName: [fileName],
                  regions: resJson.regions,
                  fileToPage: fileToPage[j],
                  lastYn: lastYn
                });
              }
            }
          }
        }
      } else {
        ocrDataArr.push({
          fileInfo: [fileInfo],
          fileName: [fileName],
          regions: resJson.regions,
          lastYn: lastYn
        });
      }
    }

    if (totCount == ocrCount) {
      ocrCount = 0;
      totCount = 0;
    }
  } else if (resJson.error) {

  } else {

  }
  return ocrDataArr;
}

exports.select = function (req, done) {
  return new Promise(async function (resolve, reject) {
      let conn;

      try {
          conn = await oracledb.getConnection(dbConfig);
          let sqltext = `SELECT EXPORT_SENTENCE_SID(:COND) SID FROM DUAL`;
          for (var i in req) {
              var sid = "";
              locSplit = req[i].location.split(",");
              sid += locSplit[0] + "," + locSplit[1];

              let result = await conn.execute(sqltext, [req[i].text]);

              if (result.rows[0] != null) {
                  sid += "," + result.rows[0].SID;
              }
              req[i].sid = sid;
          }

          return done(null, req);
      } catch (err) { 
          reject(err);
      } finally {
          if (conn) {
              try {
                  await conn.release();
              } catch (e) {
                  console.error(e);
              }
          }
      }
  });
};
exports.insertMLDataCMD = function (req, done) {
  return new Promise(async function (resolve, reject) {
    let conn;

    try {
      if (req.length) {
        conn = await oracledb.getConnection(dbConfig);

        let delSql = queryConfig.batchLearningConfig.deleteMlExport;
        await conn.execute(delSql, [req[0].filepath]);  
        
        let resCol = await conn.execute("SELECT * FROM TBL_COLUMN_MAPPING_CLS");
        let insSql = queryConfig.batchLearningConfig.insertMlExport;

        for (let i = 0; i < req.length; i++) {
          let cond = [];
          cond.push(req[i].imgid);
          cond.push(req[i].filepath);

          for (let row = 0; row < resCol.rows.length; row++) {
            if (req.mlData[0][i].label == resCol.rows[row].COLTYPE) {
              cond.push(resCol.rows[row].COLNUM);
            }
          }

          cond.push(req[i].text);
          cond.push(req[i].location);
          cond.push(req[i].sid);

          if (cond.length == 6) {
            await conn.execute(insSql, cond);
          }
        }
      }

      return done(null, "mlExport");
    } catch (err) { // catches errors in getConnection and the query
      console.log(err);
      return done(null, "error");
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
};

exports.selectLegacyData = function (req, done) {
  return new Promise(async function (resolve, reject) {
    var res = [];
    let conn;

    try {
      conn = await oracledb.getConnection(dbConfig);

      var tempImageFileName;
      for (image in req) {
        //image 파일명 추출
        var items = req[image]['mlexport']
        for (var item = 0; item < req[image]['mlexport'].length; item++) {
          if (req[image][item]['ORIGINFILENAME']) {
            tempImageFileName = req[image][item]['ORIGINFILENAME']
          }

        }
        //image id 추출
        let result = await conn.execute(`SELECT IMGID, PAGENUM FROM TBL_BATCH_ANSWER_FILE WHERE export_filename(FILEPATH) = :PARAM AND ROWNUM = 1`, [tempImageFileName]);
        result.rows[0][0] = 154384
        //image data 추출
        result = await conn.execute(`SELECT * FROM TBL_BATCH_ANSWER_DATA WHERE IMGID = :IMGID AND IMGFILEENDNO >= :PAGEEND AND IMGFILESTARTNO <= :PAGESTART`, [result.rows[0][0], result.rows[0][1], result.rows[0][1]]);
        image.push(result.rows);
        console.log(result.rows[0][1])

      }



      for (var row = 0; row < result.rows.length; row++) {
        var dict = {};
        for (var colName = 0; colName < colNameArr.length; colName++) {
          dict[colNameArr[colName]] = result.rows[row][colName];
        }
        res.push(dict);
      }

      //resolve(result.rows);
      return done(null, res);
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