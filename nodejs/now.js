//npm install python-shell -save
var PythonShell = require('python-shell')
var sync = require('./sync.js')
var appRoot = require('app-root-path').path;
//var dbConfig = require(appRoot + '/config/dbConfig');
var oracle = require('./oracle.js');
//const oracledb = require('oracledb');
var async = require('async');
var execSync = require('child_process').execSync;
var pythonConfig = require(appRoot + '/config/pythonConfig');

PythonShell.run = sync(PythonShell.run);
//oracle.selectOcrFilePaths = sync(oracle.selectOcrFilePaths);
//oracle.callApiOcr = sync(oracle.callApiOcr);
//oracle.selectLegacyData = sync(oracle.selectLegacyData);
sync.fiber(function()
{

    //ocr처리
    originImageArr[0]['FILEPATH'] = 'C:\\hskim\\down\\temp.png';
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
function makeData2 () {
    var temp = '[{"location":"2974,20,66,31","text":"page","originText":"page","sid":"2974,20,14492,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"1594,201,683,47","text":"reinsurers outstanding losses","originText":"reinsurers outstanding losses","sid":"1594,201,0,17747,18754,0,0","colLbl":36,"colAccu":0.99},{"location":"1596,259,174,29","text":"28/06/2018","originText":"28/06/2018","sid":"1596,259,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"3178,16,11,26","text":"a","originText":"1","sid":"3178,16,14459,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"3072,392,149,27","text":"remarks","originText":"remarks","sid":"3072,392,19836,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"3296,20,10,24","text":"a","originText":"1","sid":"3296,20,14459,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"218,305,1136,39","text":"010 872 2079 zoo korean reinsurance cos","originText":"010 872 2079 oo korean reinsurance co.","sid":"218,305,0,0,0,19616,18699","colLbl":36,"colAccu":0.99},{"location":"208,385,191,31","text":"al sagr","originText":"al sagr","sid":"208,385,15044,97299,0,0,0","colLbl":0,"colAccu":0.99},{"location":"1154,384,470,32","text":"share cos losses 100%","originText":"share os losses 100%","sid":"1154,384,15083,22228,18754,0,0","colLbl":36,"colAccu":0.99},{"location":"1741,385,258,31","text":"cos losses/shr","originText":"os losses/shr","sid":"1741,385,22228,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"1946,536,77,24","text":"2120","originText":"2120","sid":"1946,536,1,1,1,1,1","colLbl":7,"colAccu":0.99},{"location":"1929,616,92,24","text":"303.70","originText":"303.70","sid":"1929,616,1,1,1,1,1","colLbl":7,"colAccu":0.99},{"location":"1963,696,58,26","text":"3.65","originText":"3.65","sid":"1963,696,1,1,1,1,1","colLbl":7,"colAccu":0.99},{"location":"1932,777,92,28","text":"115.80","originText":"115.80","sid":"1932,777,1,1,1,1,1","colLbl":7,"colAccu":0.99},{"location":"1932,859,90,25","text":"124.29","originText":"124.29","sid":"1932,859,1,1,1,1,1","colLbl":7,"colAccu":0.99},{"location":"1906,940,116,30","text":"1,069.76","originText":"1,069.76","sid":"1906,940,0,0,0,0,0","colLbl":7,"colAccu":0.99},{"location":"1905,1025,117,31","text":"1,638.40","originText":"1,638.40","sid":"1905,1025,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"1930,1144,93,24","text":"350.00","originText":"350.00","sid":"1930,1144,1,1,1,1,1","colLbl":7,"colAccu":0.99},{"location":"1928,1228,94,25","text":"350.00","originText":"350.00","sid":"1928,1228,1,1,1,1,1","colLbl":36,"colAccu":0.99},{"location":"1930,1345,91,26","text":"418.15","originText":"418.15","sid":"1930,1345,1,1,1,1,1","colLbl":7,"colAccu":0.99},{"location":"1929,1432,95,24","text":"418.15","originText":"418.15","sid":"1929,1432,1,1,1,1,1","colLbl":36,"colAccu":0.99},{"location":"1902,1502,121,31","text":"2,406.55","originText":"2,406.55","sid":"1902,1502,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"2269,385,110,33","text":"ibnr","originText":"ibnr","sid":"2269,385,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"220,474,32,24","text":"72","originText":"72","sid":"220,474,1,1,1,1,1","colLbl":36,"colAccu":0.99},{"location":"336,473,248,25","text":"engineering","originText":"engineering","sid":"336,473,15349,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"228,536,212,24","text":"up 2004 01377","originText":"p 2004 01377","sid":"228,536,14508,0,0,0,0","colLbl":2,"colAccu":0.99},{"location":"227,697,213,27","text":"up 2005 01377","originText":"p 2005 01377","sid":"227,697,14508,0,0,0,0","colLbl":2,"colAccu":0.99},{"location":"225,860,215,27","text":"up 2006 01377","originText":"p 2006 01377","sid":"225,860,14508,0,0,0,0","colLbl":2,"colAccu":0.99},{"location":"221,1080,241,24","text":"74 cargo","originText":"74 cargo","sid":"221,1080,0,20299,0,0,0","colLbl":36,"colAccu":0.99},{"location":"228,1144,212,24","text":"up 2005 01377","originText":"p 2005 01377","sid":"228,1144,14508,0,0,0,0","colLbl":2,"colAccu":0.99},{"location":"221,1283,211,28","text":"75 hull","originText":"75 hull","sid":"221,1283,0,22045,0,0,0","colLbl":36,"colAccu":0.99},{"location":"227,1345,213,27","text":"up 2004 01377","originText":"p 2004 01377","sid":"227,1345,14508,0,0,0,0","colLbl":2,"colAccu":0.99},{"location":"476,1144,39,24","text":"co","originText":"co","sid":"476,1144,15106,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"560,534,211,27","text":"quota share","originText":"quota share","sid":"560,534,26337,15083,0,0,0","colLbl":1,"colAccu":0.99},{"location":"560,616,132,23","text":"surplus","originText":"surplus","sid":"560,616,21636,0,0,0,0","colLbl":1,"colAccu":0.99},{"location":"560,696,211,27","text":"quota share","originText":"quota share","sid":"560,696,26337,15083,0,0,0","colLbl":1,"colAccu":0.99},{"location":"560,776,131,24","text":"surplus","originText":"surplus","sid":"560,776,21636,0,0,0,0","colLbl":1,"colAccu":0.99},{"location":"560,856,211,30","text":"quota share","originText":"quota share","sid":"560,856,26337,15083,0,0,0","colLbl":1,"colAccu":0.99},{"location":"562,937,129,23","text":"surplus","originText":"surplus","sid":"562,937,21636,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"560,1140,241,29","text":"cargo q/share","originText":"cargo q/share","sid":"560,1140,20299,0,0,0,0","colLbl":1,"colAccu":0.99},{"location":"560,1344,216,32","text":"hull q/share","originText":"hull q/share","sid":"560,1344,22045,0,0,0,0","colLbl":1,"colAccu":0.99},{"location":"1165,536,109,24","text":"005.000","originText":"005.000","sid":"1165,536,1,1,1,1,1","colLbl":5,"colAccu":0.99},{"location":"1165,616,109,24","text":"005.000","originText":"005.000","sid":"1165,616,1,1,1,1,1","colLbl":5,"colAccu":0.99},{"location":"1165,697,109,25","text":"005.000","originText":"005.000","sid":"1165,697,1,1,1,1,1","colLbl":5,"colAccu":0.99},{"location":"1165,776,110,28","text":"005.000","originText":"005.000","sid":"1165,776,1,1,1,1,1","colLbl":5,"colAccu":0.99},{"location":"1165,858,109,30","text":"002.500","originText":"002.500","sid":"1165,858,1,1,1,1,1","colLbl":5,"colAccu":0.99},{"location":"1165,936,109,30","text":"002.500","originText":"002.500","sid":"1165,936,1,1,1,1,1","colLbl":5,"colAccu":0.99},{"location":"844,1024,275,32","text":"sub total by cob","originText":"sub total by cob","sid":"844,1024,16109,14750,14465,36226,0","colLbl":36,"colAccu":0.99},{"location":"1165,1144,109,24","text":"005.000","originText":"005.000","sid":"1165,1144,1,1,1,1,1","colLbl":5,"colAccu":0.99},{"location":"844,1227,275,33","text":"sub total by cob","originText":"sub total by cob","sid":"844,1227,16109,14750,14465,36226,0","colLbl":36,"colAccu":0.99},{"location":"1165,1344,110,28","text":"005.000","originText":"005.000","sid":"1165,1344,1,1,1,1,1","colLbl":5,"colAccu":0.99},{"location":"843,1430,275,33","text":"sub total by cob","originText":"sub total by cob","sid":"843,1430,16109,14750,14465,36226,0","colLbl":36,"colAccu":0.99},{"location":"1525,536,93,24","text":"424.00","originText":"424.00","sid":"1525,536,1,1,1,1,1","colLbl":6,"colAccu":0.99},{"location":"1499,616,119,30","text":"6,074.00","originText":"6,074.00","sid":"1499,616,0,0,0,0,0","colLbl":6,"colAccu":0.99},{"location":"1543,696,74,26","text":"73.00","originText":"73.00","sid":"1543,696,1,1,1,1,1","colLbl":6,"colAccu":0.99},{"location":"1498,776,119,31","text":"2,316.00","originText":"2,316.00","sid":"1498,776,0,0,0,0,0","colLbl":6,"colAccu":0.99},{"location":"1499,859,119,29","text":"4, 971.54","originText":"4, 971.54","sid":"1499,859,0,0,0,0,0","colLbl":6,"colAccu":0.99},{"location":"1480,938,139,32","text":"42,790.57","originText":"42,790.57","sid":"1480,938,0,0,0,0,0","colLbl":6,"colAccu":0.99},{"location":"1482,1025,134,31","text":"56,649.11","originText":"56,649.11","sid":"1482,1025,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"1500,1228,118,33","text":"7,000.00","originText":"7,000.00","sid":"1500,1228,0,0,0,0,0","colLbl":6,"colAccu":0.99},{"location":"1500,1344,117,32","text":"8,363.00","originText":"8,363.00","sid":"1500,1344,0,0,0,0,0","colLbl":6,"colAccu":0.99},{"location":"1498,1432,120,30","text":"8,363.00","originText":"8,363.00","sid":"1498,1432,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"1482,1502,134,33","text":"72,012.11","originText":"72,012.11","sid":"1482,1502,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"2488,1025,41,27","text":".00","originText":".00","sid":"2488,1025,1,1,1,1,1","colLbl":36,"colAccu":0.99},{"location":"2488,1228,41,25","text":".00","originText":".00","sid":"2488,1228,1,1,1,1,1","colLbl":36,"colAccu":0.99},{"location":"2488,1432,42,23","text":".00","originText":".00","sid":"2488,1432,1,1,1,1,1","colLbl":36,"colAccu":0.99},{"location":"2488,1503,41,23","text":".00","originText":".00","sid":"2488,1503,1,1,1,1,1","colLbl":36,"colAccu":0.99},{"location":"2581,393,62,35","text":"cry","originText":"ccy","sid":"2581,393,19610,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"2576,536,70,24","text":"aed","originText":"aed","sid":"2576,536,97302,0,0,0,0","colLbl":37,"colAccu":0.99},{"location":"2576,616,70,24","text":"aed","originText":"aed","sid":"2576,616,97302,0,0,0,0","colLbl":37,"colAccu":0.99},{"location":"2576,696,69,26","text":"aed","originText":"aed","sid":"2576,696,97302,0,0,0,0","colLbl":37,"colAccu":0.99},{"location":"2576,776,69,28","text":"aed","originText":"aed","sid":"2576,776,97302,0,0,0,0","colLbl":37,"colAccu":0.99},{"location":"2576,858,71,26","text":"aed","originText":"aed","sid":"2576,858,97302,0,0,0,0","colLbl":37,"colAccu":0.99},{"location":"2576,940,71,27","text":"aed","originText":"aed","sid":"2576,940,97302,0,0,0,0","colLbl":37,"colAccu":0.99},{"location":"2576,1026,71,25","text":"aed","originText":"aed","sid":"2576,1026,97302,0,0,0,0","colLbl":37,"colAccu":0.99},{"location":"2576,1144,70,24","text":"aed","originText":"aed","sid":"2576,1144,97302,0,0,0,0","colLbl":37,"colAccu":0.99},{"location":"2576,1228,72,25","text":"aed","originText":"aed","sid":"2576,1228,97302,0,0,0,0","colLbl":37,"colAccu":0.99},{"location":"2576,1344,69,28","text":"aed","originText":"aed","sid":"2576,1344,97302,0,0,0,0","colLbl":37,"colAccu":0.99},{"location":"2576,1432,72,24","text":"aed","originText":"aed","sid":"2576,1432,97302,0,0,0,0","colLbl":37,"colAccu":0.99},{"location":"2576,1502,72,26","text":"aed","originText":"aed","sid":"2576,1502,97302,0,0,0,0","colLbl":37,"colAccu":0.99},{"location":"2712,534,154,26","text":"31/03/2018","originText":"31/03/2018","sid":"2712,534,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"2712,614,154,26","text":"31/03/2018","originText":"31/03/2018","sid":"2712,614,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"2712,696,154,26","text":"31/03/2018","originText":"31/03/2018","sid":"2712,696,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"2712,776,154,26","text":"31/03/2018","originText":"31/03/2018","sid":"2712,776,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"2712,858,153,30","text":"31/03/2018","originText":"31/03/2018","sid":"2712,858,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"2712,938,153,30","text":"31/03/2018","originText":"31/03/2018","sid":"2712,938,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"2712,1140,153,28","text":"31/03/2018","originText":"31/03/2018","sid":"2712,1140,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"2712,1344,154,26","text":"31/03/2018","originText":"31/03/2018","sid":"2712,1344,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"832,1501,277,31","text":"total by pedant in","originText":"total by cedant in","sid":"832,1501,14750,14465,64626,14460,0","colLbl":36,"colAccu":0.99},{"location":"656,2238,481,42","text":"nasco karaoglan france","originText":"nasco karaoglan france","sid":"656,2238,0,0,15198,0,0","colLbl":36,"colAccu":0.99},{"location":"656,2286,678,34","text":"171 rue de euzenval 92380 arches","originText":"171 rue de euzenval 92380 garches","sid":"656,2286,0,24901,14631,0,0","colLbl":36,"colAccu":0.99},{"location":"652,2334,370,34","text":"to +33 147 zoo","originText":"t +33 147 oo","sid":"652,2334,14458,0,0,19616,0","colLbl":36,"colAccu":0.99},{"location":"652,2380,359,33","text":"mm.nkfrance.com","originText":"mm.nkfrance.com","sid":"652,2380,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"2432,2331,180,23","text":"cso`s 31","originText":"cso`s 31","sid":"2432,2331,0,0,0,0,0","colLbl":36,"colAccu":0.99},{"location":"1911,2360,670,21","text":"it zzz","originText":"it. zzzz","sid":"1911,2360,14470,40768,0,0,0","colLbl":36,"colAccu":0.99},{"location":"1967,2389,323,21","text":"zzz z-0i.ae z:","originText":"zzz z-0i.ae z:","sid":"1967,2389,40768,0,0,0,0","colLbl":36,"colAccu":0.99}]'
    var resPyArr = JSON.parse(temp.replace(/'/g, '"'));
    return resPyArr;
}
