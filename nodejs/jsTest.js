var sync = require('./sync.js');
var localRequest = require('sync-request');
var fs = require('fs');
var execSync = require('sync-exec');
var PythonShell = require('python-shell');

var pythonOptions = {
    mode: 'text',
    pythonPath: '',
    pythonOptions: ['-u'],
    scriptPath: '../python',
    encoding: 'utf-8',
    args: []
};

sync.fiber(function () {

    var filePath = "C:\\ICR\\uploads\\test_sanha.png";
    
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

    //lineDeleteAndNoiseDelete
    pythonOptions.args = [];
    pythonOptions.args.push(filePath);
    var resPyStr = sync.await(PythonShell.run('lineDeleteAndNoiseDelete.py', pythonOptions, sync.defer()));

    var ocrResult = sync.await(localOcr(filePath, sync.defer()));
    
    //문서하나 ocr 태워서 결과값 변수에 넣고 불러와서 파싱
    ocrResult = ocrParsing(ocrResult);

    //파싱된 결과값 좌표 기준으로 소팅 수직 ~ 수평 오름차순
    ocrResult = ocrYSort(ocrResult);

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
            var resJson = res.getBody('utf8');
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

function ocrYSort(ocrData) {
    let tempArr = new Array();
    let retArr = new Array();
    for (let item in ocrData) {
        tempArr[item] = new Array(makeindex(ocrData[item].location), ocrData[item]);
    }

    tempArr.sort(function (a1, a2) {
        a1[0] = parseInt(a1[0]);
        a2[0] = parseInt(a2[0]);
        return (a1[0] < a2[0]) ? -1 : ((a1[0] > a2[0]) ? 1 : 0);
    });

    for (var i = 0; i < tempArr.length; i++) {
        retArr.push(tempArr[i][1]);
    }

    return retArr;
}

function makeindex(location) {
    let temparr = location.split(",");
    for (let i = 0; i < 5; i++) {
        if (temparr[0].length < 5) {
            temparr[0] = '0' + temparr[0];
        }
    }
    return Number(temparr[1] + temparr[0]);
}

function ocrParsing(body) {
    var data = [];

    try {
        var body = JSON.parse(body);

        // ocr line parsing

        for (var i = 0; i < body.regions.length; i++) {
            for (var j = 0; j < body.regions[i].lines.length; j++) {
                var item = '';
                for (var k = 0; k < body.regions[i].lines[j].words.length; k++) {
                    item += body.regions[i].lines[j].words[k].text + ' ';
                }
                data.push({ 'location': body.regions[i].lines[j].boundingBox, 'text': item.trim() });
            }
        }

        // ocr x location parsing
        var xInterval = 20; // x pixel value

        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data.length; j++) {
                if (data[i].location != data[j].location) {
                    var targetLocArr = data[i].location.split(',');
                    var compareLocArr = data[j].location.split(',');
                    var width = Number(targetLocArr[0]) + Number(targetLocArr[2]); // target text width
                    var textSpacing = Math.abs(Number(compareLocArr[0]) - width) // spacing between target text and compare text

                    if (textSpacing <= xInterval && compareLocArr[1] == targetLocArr[1]) {
                        data[i].location = targetLocArr[0] + ',' + targetLocArr[1] + ',' +
                            (Number(targetLocArr[2]) + Number(compareLocArr[2]) + textSpacing) + ',' + targetLocArr[3];
                        data[i].text += ' ' + data[j].text;
                        data[j].text = '';
                        data[j].location = '';
                    }
                }
            }
        }

        for (var i = 0; i < data.length; i++) {
            if (data[i].location == '' && data[i].text == '') data.splice(i, 1);
        }
        // ocr text Unknown character parsing
        var ignoreChar = ['"'.charCodeAt(0), '\''.charCodeAt(0), '['.charCodeAt(0), ']'.charCodeAt(0),
        '{'.charCodeAt(0), '}'.charCodeAt(0)];

        for (var i = 0; i < data.length; i++) {
            var modifyText = data[i].text;
            for (var j = 0; j < data[i].text.length; j++) {
                var ascii = data[i].text.charCodeAt(j);
                if (ascii > 127 || ignoreChar.indexOf(ascii) != -1) {
                    var rep = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
                    if (!rep.test(data[i].text[j])) { // not Korean
                        rep = new RegExp(((ascii < 128) ? '\\' : '') + data[i].text[j], "gi");
                        modifyText = modifyText.replace(rep, '');
                    }
                }
            }
            data[i].text = modifyText;
        }

    } catch (e) {
        console.log(e);
        data = { 'error': e };
    } finally {
        return data;
    }
}