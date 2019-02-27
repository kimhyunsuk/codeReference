'use strict';
var express = require('express');
var router = express.Router();
var multer = require("multer");
var ocrUtil = require('./util/ocr.js');
var sync = require('./util/sync.js');

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'C:\\ICR\\uploads\\');
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    }),
});

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index2');
});

router.post('/uploadFile', upload.any(), function (req, res) {
    sync.fiber(function () {
        var files = req.files;
        var convertedImagePath = 'C:\\ICR\\uploads\\';
        try {

            var ocrResult = sync.await(ocrUtil.localOcr(req.files[0].path, sync.defer()));
            console.log(ocrResult);
            console.log('upload suceess');
        } catch(err) {
            status = 500;
            console.log(err);
        } finally {
            res.send({'ocrResult': ocrResult});        
        }
    })
});

router.post('/uploadFile', upload.any(), function (req, res) {
    sync.fiber(function () {
        var files = req.files;
        var uploadImagePath = req.files[0].path;
        try {

            var ocrResult = sync.await(ocrUtil.localOcr(req.files[0].path, sync.defer()));
            console.log(ocrResult);
            console.log('upload suceess');
        } catch(err) {
            status = 500;
            console.log(err);
        } finally {
            res.send({'uploadImagePath': uploadImagePath});        
        }
    })
});

router.post('/imgOcr', function (req, res) {
    sync.fiber(function () {
        var trainResultList = [];
        var status;
        var fileInfoList = req.body.fileInfoList;
        var docLabelDefList;
        var docAnswerDataList;
        try {
            //var imgid = sync.await(oracle.selectImgid(filepath, sync.defer()));
            //imgid = imgid.rows[0].IMGID;

            var fullFilePathList = [];
            for(var i = 0; i< fileInfoList.length; i++) {
                fullFilePathList.push(fileInfoList[i].convertedFilePath + fileInfoList[i].convertFileName);
            }

            for (var i = 0; i < fullFilePathList.length; i++) {
                var selOcr = sync.await(oracle.selectOcrData(fullFilePathList[i], sync.defer()));
                if (selOcr.length == 0) {
                    var ocrResult = sync.await(ocrUtil.localOcr(fullFilePathList[i], sync.defer()));

                    if ((ocrResult.textAngle != "undefined" && ocrResult.textAngle > 0.01 || ocrResult.textAngle < -0.01) || ocrResult.orientation != "Up") {
                        var angle = 0;

                        if (ocrResult.orientation == "Left") {
                            angle += 90;
                        } else if (ocrResult.orientation == "Right") {
                            angle += -90;
                        } else if (ocrResult.orientation == "Down") {
                            angle += 180;
                        }

                        angle += Math.floor(ocrResult.textAngle * 100);

                        if (angle < 0) {
                            angle += 2;
                        } else {
                            angle -= 1;
                        }

                        execSync('module\\imageMagick\\convert.exe -rotate "' + angle + '" ' + fullFilePathList[i] + ' ' + fullFilePathList[i]);

                        ocrResult = sync.await(ocrUtil.localOcr(fullFilePathList[i], sync.defer()));
                    }

                    sync.await(oracle.insertOcrData(fullFilePathList[i], JSON.stringify(ocrResult), sync.defer()));
                    selOcr = sync.await(oracle.selectOcrData(fullFilePathList[i], sync.defer()));
                }

                var seqNum = selOcr.SEQNUM;
                pythonConfig.columnMappingOptions.args = [];
                pythonConfig.columnMappingOptions.args.push(seqNum);
                //var resPyStr = sync.await(PythonShell.run('batchClassifyTest.py', pythonConfig.columnMappingOptions, sync.defer()));
                var resPyStr = sync.await(PythonShell.run('samClassifyTest.py', pythonConfig.columnMappingOptions, sync.defer()));
                var testStr = resPyStr[0].replace('b', '');
                testStr = testStr.replace(/'/g, '');
                var decode = new Buffer(testStr, 'base64').toString('utf-8');

                var resPyArr = JSON.parse(decode);
                resPyArr = sync.await(transPantternVar.trans(resPyArr, sync.defer()));
                resPyArr.fileName = fullFilePathList[i].substring(fullFilePathList[i].lastIndexOf('/') + 1);
                console.log(resPyArr);

                trainResultList.push(resPyArr);
                
                // tbl_icr_label_def 조회
                var docToptype = resPyArr.docCategory.DOCTOPTYPE;
                docLabelDefList = sync.await(oracle.selectDocLabelDefList(([docToptype]), sync.defer()));
                //console.log(docLabelDefList);
                
                // tbl_batch_po_answer_data 조회 docTotptye, filename
                //var filename = req.fileInfoList[0].oriFileName
                docAnswerDataList = sync.await(oracle.selectAnswerData(({'docToptype': docToptype}), sync.defer()));
                
                status = 200;
            }

        } catch (e) {
            status = 500;
            console.log(e);
        } finally {
            res.send({'status': status, 'trainResultList': trainResultList, 'docLabelDefList': docLabelDefList, 'docAnswerDataList': docAnswerDataList});
        }


    });
});

module.exports = router;
