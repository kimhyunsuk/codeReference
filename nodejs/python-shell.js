//npm install python-shell -save
var PythonShell = require('python-shell')
var sync = require('./sync.js')
var appRoot = require('app-root-path').path;
var dbConfig = require(appRoot + '/config/dbConfig');
var oracle = require('./oracle.js');
const oracledb = require('oracledb');
var async = require('async');

PythonShell.run = sync(PythonShell.run);
//oracledb.createPool = sync(oracledb.createPool);
oracle.selectOcrFilePaths = sync(oracle.selectOcrFilePaths);

sync.fiber(function()
{


    tempimage = 'C:\\tmp\\26.tif'



    exec('module\\imageMagick\\convert.exe -density 800x800 ' + tempimage + ' ' + ofile, function (err, out, code) {
        if (endCount === result.length - 1) { // 모든 파일 변환이 완료되면
            res.send({ code: 200, message: returnObj, fileInfo: fileInfo });
        }
        endCount++;
    });


    //입력값 추후 ocr sid로 변경
    var originArr = ["lz3undx9lds", "24ec64hwith","v67gqowcr9"]
    //tbl_ocr_file테이블에서 이미지 절대 경로 추출
    var originImageArr = sync.await(oracle.selectOcrFilePaths(originArr,sync.defer()));
    //tif파일일 경우 이미지 파일로 전환
    for (item in originImageArr) {
        if (oriFileName.split('.')[1].toLowerCase() === 'tif' || oriFileName.split('.')[1].toLowerCase() === 'tiff') {
            
        }


        
        
    }
    //ocr처리

    //결과값 머신러닝 처리

    //정답 테이블과 비교

    //비교 결과 리턴







    var returnArr = new Array()

    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: './referenceSource/ml/typosentence',
        args: ['value1 semple']
    }

    


    options.args = JSON.stringify(originArr)

    var resPyStr = sync.await(PythonShell.run('typo.py',options,sync.defer()));

    var resPyArr = JSON.parse(resPyStr[0].replace(/'/g, '"'));


    var sidData = sync.await(oracle.select(resPyArr,sync.defer()));

    console.log('end');

})


