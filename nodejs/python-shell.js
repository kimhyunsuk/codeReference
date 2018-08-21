//npm install python-shell -save
var PythonShell = require('python-shell')
var sync = require('./sync.js')
var appRoot = require('app-root-path').path;
var dbConfig = require(appRoot + '/config/dbConfig');
var oracle = require('./oracle.js');
const oracledb = require('oracledb');
var async = require('async');
var execSync = require('child_process').execSync;

PythonShell.run = sync(PythonShell.run);
oracle.selectOcrFilePaths = sync(oracle.selectOcrFilePaths);
oracle.callApiOcr = sync(oracle.callApiOcr);
oracle.selectLegacyData = sync(oracle.selectLegacyData);
sync.fiber(function()
{

    var testarr = makeData();
    console.log(testarr) 
    //입력값 추후 ocr sid로 변경
    var originArr = ["q5jjv7slub", "wha285cq0q"]
    //tbl_ocr_file테이블에서 이미지 절대 경로 추출
    var originImageArr = sync.await(oracle.selectOcrFilePaths(originArr,sync.defer()));


    //tif파일일 경우 이미지 파일로 전환
    for (item in originImageArr) {
        if (originImageArr[item].ORIGINFILENAME.split('.')[1].toLowerCase() === 'tif' || originImageArr[item].ORIGINFILENAME.split('.')[1].toLowerCase() === 'tiff') {
            let result = sync.await(oracle.convertTiftoJpg(originImageArr[item].FILEPATH,sync.defer()));
            if (!result) {
                //추후 변경전 파일명 저장
                originImageArr[item]['ORIGINFILEPATH'] = originImageArr[item]['FILEPATH'];
                originImageArr[item]['FILEPATH'] = result;
            }
        }
    }
    //ocr처리
    originImageArr[0]['ORIGINFILEPATH'] = originImageArr[0]['FILEPATH'];
    originImageArr[0]['FILEPATH'] = 'C:\\tmp\\temp.jpg';
    var ocrResult = sync.await(oracle.callApiOcr(originImageArr,sync.defer()));

    //결과값 머신러닝 처리
    //typo ML
    pythonConfig.typoOptions.args.push(JSON.stringify(dataToTypoArgs(ocrResult)));
    var resPyStr = sync.await(PythonShell.run('typo2.py', pythonConfig.typoOptions, sync.defer()));
    var resPyArr = JSON.parse(resPyStr[0].replace(/'/g, '"'));
    var sidData = sync.await(oracle.select(resPyArr, sync.defer()));
    //form label mapping DL
    pythonConfig.formLabelMappingOptions.args.push(JSON.stringify(sidData));
    resPyStr = sync.await(PythonShell.run('eval2.py', pythonConfig.formLabelMappingOptions, sync.defer()));
    resPyArr = JSON.parse(resPyStr[0].replace(/'/g, '"'));
    //form mapping DL
    pythonConfig.formMappingOptions.args.push(JSON.stringify(resPyArr));
    resPyStr = sync.await(PythonShell.run('eval2.py', pythonConfig.formMappingOptions, sync.defer()));
    resPyArr = JSON.parse(resPyStr[0].replace(/'/g, '"'));
    var docData = sync.await(oracle.selectDocCategory(resPyArr, sync.defer()));
    //column mapping DL
    pythonConfig.columnMappingOptions.args.push(JSON.stringify(docData.data));
    resPyStr = sync.await(PythonShell.run('eval2.py', pythonConfig.columnMappingOptions, sync.defer()));
    resPyArr = JSON.parse(resPyStr[0].replace(/'/g, '"'));       
    //정답 테이블 데이터 추출


    //정답 테이블과 비교
    
    
    var cobineRegacyData = sync.await(oracle.selectLegacyData(testarr,sync.defer()));

    
 

    //비교 결과 리턴






})

function makeData () {
    //image file당 하나의 배열
    var res = [];
    //ml export와 legacy data 구분 
    var classDict = {};
    //단일 계약
    var singleContract = [];

    var dict = {};
    dict['SEQNUM'] = 2045
    dict['FILEPATH'] = "\\uploads\\2.tif"
    dict['ORIGINFILENAME'] = "204d62.tif"
    var dict2 = {};
    dict2['location'] = '154,1,683,47'
    dict2['text'] = 'cage'
    dict2['originText'] = 'page'
    dict2['sid'] = '1596,219,0,0,0,0,0'
    dict2['formLabel'] = 3
    var dict3 = {};
    dict3['location'] = '1594,201,683,47'
    dict3['text'] = 'reinsurers outstanding losses'
    dict3['originText'] = 'reinsurers outstanding losses'
    dict3['sid'] = '1596,219,0,0,0,0,0'
    dict3['formLabel'] = 1
    contractArr = []
    
    contractDict = {}
    //단일 계약안에 아이템 푸시
    singleContract.push(dict);
    singleContract.push(dict2);
    singleContract.push(dict3);
    contractDict['1'] = singleContract

    //이미지 한장에 다중 계약이 있을경우 contractDict key 증가
    contractArr.push(contractDict);
    classDict['mlexport'] = contractDict
    res.push(classDict);
    return res;
}