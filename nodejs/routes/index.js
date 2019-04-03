'use strict';
var express = require('express');
var router = express.Router();
var multer = require('multer');
var ocrUtil = require('./util/ocr.js');
var sync = require('./util/sync.js');
var execSync = require('sync-exec');

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
    res.render('index');
});

router.get('/index2', function (req, res) {
    res.render('index2');
});

router.get('/index3', function (req, res) {
    res.render('index3');
});

router.post('/uploadFile', upload.any(), function (req, res) {
    sync.fiber(function () {
        var ocrResult;
        try {
            ocrResult  = sync.await(ocrUtil.localOcr(req.files[0].path, sync.defer()));
            if (ocrResult.orientation != undefined && ocrResult.orientation != "Up") {
                var angle = 0;

                if (ocrResult.orientation == "Left") {
                    angle += 90;
                    execSync('module\\imageMagick\\convert.exe -colors 8 -density 300 -rotate "' + angle + '" ' + req.files[0].path + ' ' + req.files[0].path);
                    ocrResult = sync.await(ocrUtil.localOcr(req.files[0].path, sync.defer()));
                    angle -= 90;
                    execSync('module\\imageMagick\\convert.exe -colors 8 -density 300 -rotate "' + angle + '" ' + req.files[0].path + ' ' + req.files[0].path);
                } else if (ocrResult.orientation == "Right") {
                    angle += -90;
                    execSync('module\\imageMagick\\convert.exe -colors 8 -density 300 -rotate "' + angle + '" ' + req.files[0].path + ' ' + req.files[0].path);
                    ocrResult = sync.await(ocrUtil.localOcr(req.files[0].path, sync.defer()));
                    angle -= -90;
                    execSync('module\\imageMagick\\convert.exe -colors 8 -density 300 -rotate "' + angle + '" ' + req.files[0].path + ' ' + req.files[0].path);
                } else if (ocrResult.orientation == "Down") {
                    angle += 180;
                    execSync('module\\imageMagick\\convert.exe -colors 8 -density 300 -rotate "' + angle + '" ' + req.files[0].path + ' ' + req.files[0].path);
                    ocrResult = sync.await(ocrUtil.localOcr(req.files[0].path, sync.defer()));
                    angle -= 180;
                    execSync('module\\imageMagick\\convert.exe -colors 8 -density 300 -rotate "' + angle + '" ' + req.files[0].path + ' ' + req.files[0].path);
                } else if (ocrResult.orientation == "NotDetected") {
                    ocrResult = "error";
                }
   
            }

            // if (ocrResult)
            // for (var j = 0; j < 10; j++) {
            //     if ((ocrResult.textAngle != undefined && ocrResult.textAngle > 0.03 || ocrResult.textAngle < -0.03)) {
            //         var angle = 0;

            //         var textAngle = Math.floor(ocrResult.textAngle * 100);

            //         if (textAngle < 0) {
            //             angle += 3;
            //         } else if (textAngle == 17 || textAngle == 15 || textAngle == 14) {
            //             angle = 10;
            //         } else if (textAngle == 103) {
            //             angle = 98;
            //         }

            //         execSync('module\\imageMagick\\convert.exe -colors 8 -density 300 -rotate "' + (textAngle + angle) + '" ' + req.files[0].path + ' ' + req.files[0].path);

            //         ocrResult = sync.await(ocrUtil.localOcr(req.files[0].path, sync.defer()));
            //     } else {
            //         break;
            //     }
                
            // }

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


module.exports = router;
