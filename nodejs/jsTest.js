var sync = require('./sync.js');
var localRequest = require('sync-request');
var fs = require('fs');
var execSync = require('sync-exec');

sync.fiber(function() {
    var filePath = "C:\\ICR\\uploads\\2.tif";
    
    var fileExt = filePath.substring(filePath.lastIndexOf(".") + 1, filePath.length);

    if (fileExt.toLowerCase() == "tif") {
        var ifile = filePath;
        var ofile = filePath.substring(0, filePath.lastIndexOf(".")) + ".jpg";
        
        execSync('module\\imageMagick\\convert.exe -colorspace Gray -density 800x800 ' + ifile + ' ' + ofile);
        
        filePath = ofile;
    }else if (fileExt.toLowerCase() == "pdf") {
        var ifile = filePath;
        var ofile = filePath.substring(0, filePath.lastIndexOf(".")) + ".png";

        execSync('module\\imageMagick\\convert.exe -colors 8 -density 300 -colorspace Gray -alpha remove -alpha off "' + ifile + '" "' + ofile + '"');

        filePath = ofile;
    }

    var ocrResult = sync.await(localOcr(filePath, sync.defer()));
    console.log(ocrResult);

    //문서하나 ocr 태워서 결과값 변수에 넣고 불러와서 파싱

    //파싱된 결과값 좌표 기준으로 소팅 수직 ~ 수평 오름차순

    //문장하나씩 불러올것 관계있는 문장들 같이 불러올것 좌표 왼쪽 위쪽

});

function localOcr(req, done) {
    return new Promise(async function (resolve, reject) {
        var pharsedOcrJson = "";
        try {
            var uploadImage = fs.readFileSync(req, 'binary');
            var base64 = new Buffer(uploadImage, 'binary').toString('base64');
            var binaryString = new Buffer(base64, 'base64').toString('binary');
            uploadImage = new Buffer(binaryString, "binary");

            var res = localRequest('POST', 'https://japaneast.api.cognitive.microsoft.com/vision/v1.0/ocr', {
                headers: {
                    'Ocp-Apim-Subscription-Key': 'c4af1927bf124533bcf2bcc92fd4c63d',
                    'Content-Type': 'application/octet-stream'
                },
                uri: 'https://japaneast.api.cognitive.microsoft.com/vision/v1.0/ocr' + '?' + 'language=unk&detectOrientation=true',
                body: uploadImage,
                method: 'POST'
            });
            var resJson = JSON.parse(res.getBody('utf8'));
            //pharsedOcrJson = ocrJson(resJson.regions);
            //var resJson = ocrParsing(res.getBody('utf8'));

            return done(null, resJson);
        } catch (err) {
            console.log(err);
            return done(null, 'error');
        } finally {

        }
    });   
};