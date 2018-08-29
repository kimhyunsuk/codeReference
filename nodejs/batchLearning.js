//npm install python-shell -save
var PythonShell = require('python-shell')
var sync = require('./sync.js')
var appRoot = require('app-root-path').path;
var dbConfig = require(appRoot + '/config/dbConfig');
var oracle = require('./oracle.js');
const oracledb = require('oracledb');
var async = require('async');
var execSync = require('child_process').execSync;
var pythonConfig = require(appRoot + '/config/pythonConfig');

PythonShell.run = sync(PythonShell.run);
oracle.selectOcrFilePaths = sync(oracle.selectOcrFilePaths);
oracle.callApiOcr = sync(oracle.callApiOcr);
oracle.selectLegacyData = sync(oracle.selectLegacyData);



sync.fiber(function () {
    sync.await(batchLearnTraing(sync.defer()));
});


function batchLearnTraing(done) {
    sync.fiber(function () {
        try {
            //makeData2 ();
            var retData = {};
            var term = '2018%';
            //var temp = makeData2 ();
            var resLegacyData = sync.await(oracle.selectLegacyFileData(term, sync.defer()));
    
            for (let tiffile in resLegacyData) {
                console.time("convertTiftoJpg : " + resLegacyData[tiffile].FILEPATH);
                //var filename = resLegacyData[tiffile].FILENAME;
                //var imgId = resLegacyData[tiffile].IMGID;
                let convertFilpath = resLegacyData[tiffile].FILEPATH;
                if (resLegacyData[tiffile].FILENAME.split('.')[1].toLowerCase() === 'tif' || resLegacyData[tiffile].FILENAME.split('.')[1].toLowerCase() === 'tiff') {
                    let imageRootDir = 'C:/ICR/MIG/MIG';
                    let result = sync.await(oracle.convertTiftoJpg(imageRootDir + resLegacyData[tiffile].FILEPATH, sync.defer()));
                    if (result == "error") {
                        return done(null, "error convertTiftoJpg");
                    }
                    if (result) {
                        convertFilpath = result;
                    }
                }
                console.timeEnd("convertTiftoJpg : "+ resLegacyData[tiffile].FILEPATH);
        
                //ocr
                console.time("ocr : " + resLegacyData[tiffile].FILEPATH);
                let ocrResult = sync.await(oracle.callApiOcr(convertFilpath, sync.defer()));
                //var ocrResult = sync.await(ocrUtil.proxyOcr(convertFilpath, sync.defer())); -- 운영서버용
        
                if (ocrResult == "error") {
                    return done(null, "error ocr");
                }
                console.timeEnd("ocr : " + resLegacyData[tiffile].FILEPATH);
        
                //typo ML
                console.time("typo ML : " + resLegacyData[tiffile].FILEPATH);
                pythonConfig.typoOptions.args = [];
                pythonConfig.typoOptions.args.push(JSON.stringify(dataToTypoArgs(ocrResult)));
                let resPyStr = sync.await(PythonShell.run('typo2.py', pythonConfig.typoOptions, sync.defer()));
                let resPyArr = JSON.parse(resPyStr[0].replace(/'/g, '"'));
                let sidData = sync.await(oracle.select(resPyArr, sync.defer()));
                console.timeEnd("typo ML : " + resLegacyData[tiffile].FILEPATH);
        
                console.time("similarity ML : " + resLegacyData[tiffile].FILEPATH);
                pythonConfig.typoOptions.args = [];
                pythonConfig.typoOptions.args.push(JSON.stringify(resLegacyData[tiffile]));
                pythonConfig.typoOptions.args.push(JSON.stringify(sidData));
                resPyStr = sync.await(PythonShell.run('similarityBatch.py', pythonConfig.typoOptions, sync.defer()));
                resPyArr = JSON.parse(resPyStr[0].replace(/'/g, '"'));
                console.timeEnd("similarity ML : " + resLegacyData[tiffile].FILEPATH);
                
                console.time("insert MLExport : " + resLegacyData[tiffile].FILEPATH);
                sync.await(oracle.insertMLDataCMD(resPyArr, sync.defer()));
                console.timeEnd("insert MLExport : " + resLegacyData[tiffile].FILEPATH);
            }
            console.log("done");
            return done(null, "");
        } catch (e) {
            console.log(e);
            return done(null, e);
        }
    });
}

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

function dataToTypoArgs(data) {

    for (var i in data) {
        data[i].text = data[i].text.toLowerCase().replace("'", "`");
    }
    return data;
}

function makeData2 () {
    var temp = '[{\'originText\': \'xls\', \'text\': \'els\', \'location\': \'2043,270,127,43\'}, {\'originText\': \'as mentioned earlier, the shop had suffered smoke and soot damage and therefore had to under\', \'text\': \'as mentioned earlier thea shop had suffered smoke and soot damage and therefore had to under\', \'location\': \'362,469,1841,46\'}, {\'originText\': \'go professional cleaning.\', \'text\': \'go professional cleanings\', \'location\': \'363,552,478,44\'}, {\'originText\': \'further, as the entire stock of the insured had been damaged in the fire,the insured had to\', \'text\': \'further as thea entire stock of thea insuredhad been damaged in thea fired thea insured had to\', \'location\': \'362,727,1838,45\'}, {\'originText\': \'procure fresh stocks in order to re-commence its business. given the fact mango is a premium\', \'text\': \'procure fresh stocks inorder to re-commence its business. given thea fact mango is a premium\', \'location\': \'361,810,1843,45\'}, {\'originText\': \'brand, the parent company workson a tight ordering schedule. however, the insured explained\', \'text\': \'brand thea parent company works on a tight ordering scheduled however thea insuredexplained\', \'location\': \'361,892,1841,46\'}, {\'originText\': \'the situation and therefore was successful in placing interim orders.\', \'text\': \'thea situation and therefore was successful in placing interim orders\', \'location\':\'361,977,1290,45\'}, {\'originText\': \'however, due to lack of utilities and power at the mall, the insured was unable to carry out the\', \'text\': \'howeverdue to lack of utilities and power at thea malls thea insured was unable to carry out thea\', \'location\': \'361,1143,1842,46\'}, {\'originText\': \'repairs/professional cleaning at the insured outlet, soon after the loss. this in turn has caused\', \'text\': \'repairs professional cleaning at thea insured outlet soon after thea loss this in turn has caused\', \'location\': \'361,1227,1841,46\'}, {\'originText\': \'an increase in the period of interruption and thereby hasresulted in an increase in the indemnity\', \'text\': \'an increase in thea period of interruption and thereby has resulted in an increase in thea indemnity\',\'location\': \'362,1311,1841,46\'}, {\'originText\': \'period.\', \'text\': \'period\', \'location\': \'361,1396,131,34\'}, {\'originText\': "the policy defines `indemnity period\' as the period during which the results of the business", \'text\': \'thea policy defines `indemnity period as thea period during which thea results of thea business\', \'location\': \'361,1561,1841,46\'}, {\'originText\': \'shall be affected in consequence of the damage. it is our considered viewthat the period of\', \'text\': \'shall be affected in consequence of thea damage it is our considered view that thea period of\', \'location\': \'362,1644,1845,46\'}, {\'originText\': \'interruption in this instance is not entirely due tothe incident. rather, it was aggravated due to\', \'text\': \'interruption in this instance is not entirely due to thea incidents rather it was aggravated due to\', \'location\': \'361,1727,1840,45\'}, {\'originText\': \'the non-availability of power at the premises.\', \'text\': \'thea non-availability of power at thea premises.\', \'location\': \'360,1812,867,44\'}, {\'originText\': \'as a result, it is our view that the indemnity period in this instance be equitably restricted to 80\', \'text\': \'as a result it is our view that thea indemnity periodin this instance be equitably restricted to 80\', \'location\': \'359,1976,1841,45\'}, {\'originText\': \'days, which period, in our opinion, reflects the period of interruption as a direct consequence of\', \'text\': \'days which period inour opinion reflects thea period of interruption as a direct consequence of\',\'location\': \'360,2059,1847,46\'}, {\'originText\': \'the incident. this period has been calculated based on the estimated period of\', \'text\': \'thea incidents this period has been calculated based on thea estimated period of\', \'location\': \'359,2143,1849,46\'}, {\'originText\': \'repair/professional cleaning,time required to re-stock and commence business.\', \'text\': \'repair/professional cleanings time required to restock and commence business.\', \'location\': \'359,2227,1515,45\'}, {\'originText\': \'this aspect of the claim calculation was discussed at length with the insured and their brokers.\', \'text\': \'this aspect of thea claim calculation was discussed at length with thea insured and their brokers\', \'location\': \'359,2393,1840,46\'}, {\'originText\': \'in courseof these discussions, we pointed out several similar instances in the past to justify our\', \'text\': \'in course of these discussions, we pointed out severalsimilar instances in thea past to justify our\', \'location\': \'360,2477,1843,45\'}, {\'originText\': \'view. after protracted discussions, our views were accepted and we therefore determined the\', \'text\': \'views after protracted discussions, our views were accepted and we therefore determined thea\', \'location\': \'359,2559,1843,46\'}, {\'originText\': \'indemnity period (as defined in thepolicy) at 80 days, i.e., from 2o may to 15th august 2012.\', \'text\': \'indemnity period vas defined in thea policy at 80 days i.e., from no may to 15th august 2012.\', \'location\': \'359,2632,1829,55\'}, {\'originText\': \'rate of grossprofit\', \'text\': \'rate of gross profit\', \'location\': \'359,2815,411,34\'}, {\'originText\': \'in accordance with the policy definition, the insured rateof gross profit has been determined\', \'text\': \'in accordance with thea policy definitions thea insured rate of gross profit has been determined\', \'location\': \'359,2900,1843,44\'}, {\'originText\': \'at 38.03% based on the audited financial statements of the insured for the financial year ended\', \'text\': \'at 38.03% based on thea audited financial statements of thea insured for thea financial year ended\', \'location\': \'360,2981,1842,44\'}, {\'originText\': \'page 12 of 15\', \'text\': \'page 12 of 15\', \'location\': \'1932,3166,265,44\'}]'
    var resPyArr = JSON.parse(temp.replace(/'/g, '"'));
    return resPyArr;
}
