var oracledb = require('oracledb');
var appRoot = require('app-root-path').path;
var dbConfig = require(appRoot + '/config/dbConfig');
var sync = require('./sync.js')
var execSync = require('child_process').execSync;
var fs = require('fs');
var propertiesConfig = require(appRoot + '/config/propertiesConfig.js');
var request = require('request');
var request = require('sync-request');


let sqltext = `SELECT FILEPATH,ORIGINFILENAME FROM TBL_OCR_FILE WHERE IMGID IN (`;

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
    execSync('module\\imageMagick\\convert.exe -density 800x800 ' + originFilePath + ' ' + convertedFileName);
    return done(null, convertedFileName);

  } catch (err) {
    console.log(err);
  } finally {
    console.log('end');
  }
}

exports.callApiOcr = function (originImageArr, done) {
  try {
    for (item in originImageArr) {
      console.log(originImageArr[item]['FILEPATH'])
      var uploadImage = fs.readFileSync(originImageArr[item]['FILEPATH'], 'binary');
      var base64 = new Buffer(uploadImage, 'binary').toString('base64');
      var binaryString = new Buffer(base64, 'base64').toString('binary');
      uploadImage = new Buffer(binaryString, "binary");

      var res = request('POST', propertiesConfig.ocr.uri, {
        headers: {
          'Ocp-Apim-Subscription-Key': propertiesConfig.ocr.subscriptionKey,
          'Content-Type': 'application/octet-stream'
        },
        uri: propertiesConfig.ocr.uri + '?' + 'language=unk&detectOrientation=true',
        body: uploadImage,
        method: 'POST'
      });
      var resJson = JSON.parse(res.getBody('utf8'));
      var pharsedOcrJson = phasingOcrJson(resJson);
    }
    return done(null, originImageArr);
  } catch (err) {
    console.log(err);
  } finally {
    console.log('end');
  }
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
        result = await conn.execute(`SELECT * FROM TBL_BATCH_ANSWER_DATA WHERE IMGID = :IMGID AND IMGFILEENDNO >= :PAGEEND AND IMGFILESTARTNO <= :PAGESTART`, [result.rows[0][0],result.rows[0][1],result.rows[0][1]]);
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