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
            var retData = {};
            var filename = '2018%';
            //var temp = makeData2 ();
            if (filename.split('.')[1].toLowerCase() === 'tif' || filename.split('.')[1].toLowerCase() === 'tiff') {
                let result = sync.await(oracle.convertTiftoJpg(filepath, sync.defer()));
    
                if (result == "error") {
                    return done(null, "error convertTiftoJpg");
                }
    
                if (result) {
                    convertFilpath = result;
                }
            }
            console.timeEnd("convertTiftoJpg");
    
            //ocr
            console.time("ocr");
            var ocrResult = sync.await(oracle.callApiOcr(propertiesConfig.filepath.answerFileFrontPath + convertFilpath, sync.defer()));
            //var ocrResult = sync.await(ocrUtil.proxyOcr(originImageArr.CONVERTEDIMGPATH, sync.defer())); -- 운영서버용
    
            if (ocrResult == "error") {
                return done(null, "error ocr");
            }
            console.timeEnd("ocr");
    
            //typo ML
            console.time("typo ML");
            pythonConfig.typoOptions.args = [];
            pythonConfig.typoOptions.args.push(JSON.stringify(dataToTypoArgs(ocrResult)));
            var resPyStr = sync.await(PythonShell.run('typo2.py', pythonConfig.typoOptions, sync.defer()));
            var resPyArr = JSON.parse(resPyStr[0].replace(/'/g, '"'));
            var sidData = sync.await(oracle.select(resPyArr, sync.defer()));
            console.timeEnd("typo ML");
    
            console.time("similarity ML");
            pythonConfig.typoOptions.args = [];
            pythonConfig.typoOptions.args.push(JSON.stringify(resLegacyData));
            pythonConfig.typoOptions.args.push(JSON.stringify(sidData));
            var resPyStr = sync.await(PythonShell.run('similarity.py', pythonConfig.typoOptions, sync.defer()));
            var resPyArr = JSON.parse(resPyStr[0].replace(/'/g, '"'));
            console.timeEnd("similarity ML");
            
            var mlData = {};
    
            mlData["mlData"] = resPyArr;
            mlData["filepath"] = filepath;
            mlData["imgId"] = imgId;
            retData["mlexport"] = mlData;
    
            //insert MLexport data to batchMlExport
            console.time("insert MLExport");
            var resMLData = sync.await(oracle.insertMLData(mlData, sync.defer()));
            console.timeEnd("insert MLExport");
    
            console.log("done");
            return done(null, retData);
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
    var temp = '[{\'originText\': \'xls\', \'location\': \'2050,270,126,42\', \'text\': \'els\'}, {\'originText\': \'them to the inventory system as well as to the financialrecords. no major discrepancies were\', \'location\': \'367,379,1842,46\', \'text\': \'them to thea inventory system as well as to thea financial records no major discrepancies were\'}, {\'originText\': \'found.\', \'location\': \'369,461,119,35\', \'text\': \'found\'}, {\'originText\': \'further, in order to carry out an analytical review of the stock inventory as at the date of loss,\', \'location\': \'367,627,1838,44\', \'text\': \'further in order to carry out an analytical review of thea stock inventory as at thea date of loss\'}, {\'originText\':\'we reviewed the four months average stock holding at the risk / loss address prior to the date\', \'location\': \'366,709,1840,44\', \'text\': \'we reviewed thea four months average stock holding at thea risk i loss address prior to theadate\'}, {\'originText\': \'of loss using the financial information from the financial accounting system. in course of this\', \'location\': \'367,791,1839,45\', \'text\': \'of loss using thea financial information from thea financial accounting systems in course of this\'}, {\'originText\': \'exercise, we obtained theopening stock value from the financial records to which we added\', \'location\': \'367,874,1840,45\', \'text\': \'exerciser we obtained thea opening stock value from thea financial records to which we added\'}, {\'originText\': \'the value of purchases. we then calculated the cost of goods sold by deducting the margin\', \'location\': \'365,957,1842,46\', \'text\': \'thea value of purchases we then calculated thea cost of goods sold by deducting thea margin\'}, {\'originText\': \'from sales made during the period. through this method we calculated theapproximate value\', \'location\': \'366,1041,1840,45\', \'text\': \'from salesmade during thea periods through this method we calculated thea approximate value\'}, {\'originText\': \'of stock and established that the stock per the inventory records to be reasonably stated.\', \'location\': \'366,1125,1679,45\', \'text\': \'of stock and established that thea stock per thea inventory records to bereasonably stated\'}, {\'originText\': \'we also calculated the monthly inventory turnover ratios for two years prior to the date of loss\', \'location\': \'364,1292,1841,45\', \'text\': \'we also calculated thea monthly inventory turnoverratios for two years prior to thea date of loss\'}, {\'originText\': \'and aresatisfied that the stock holding at the store as at the date of loss is reasonable and\', \'location\': \'365,1376,1841,45\', \'text\': \'and are satisfied thatthea stock holding at thea store as at thea date of loss is reasonable and\'},{\'originText\': \'consistent for the turnover achieved.\', \'location\': \'365,1460,698,35\', \'text\': \'consistent for thea turnover achieved.\'}, {\'originText\': \'thus we are satisfied the claim can be adjusted using the theoretical gross book value of the\', \'location\': \'364,1626,1843,45\', \'text\': \'thus we are satisfied thea claim can be adjusted using thea theoretical gross book value of thea\'}, {\'originText\': \'stocks from the insured`s inventory records. however, several adjustments had to be made to\', \'location\': \'365,1709,1838,45\', \'text\': \'stocks from thea insureds inventory records however several adjustments had to be made to\'}, {\'originText\': \'the stock claim submitted by the insured, as detailed below:\', \'location\': \'363,1792,1146,44\', \'text\':\'thea stock claim submitted by thea insured as detailed below\'}, {\'originText\': \'adjustments to the theoretical gross book value of stocks\', \'location\':\'362,1960,1216,42\', \'text\': \'adjustments to thea theoretical gross book value of stocks\'}, {\'originText\': \'physical count variations\', \'location\':\'362,2126,540,43\', \'text\': \'physical count variations\'}, {\'originText\':\'the insured carries out physical stock counts at the end of each year. the last such count, prior\', \'location\': \'362,2207,1844,45\', \'text\': \'thea insured carries out physical stock counts at thea end of each years thea last such counts prior\'}, {\'originText\': \'to the date of loss was carr to find a difference\', \'location\': \'361,2291,1844,43\', \'text\': \'to thea date of loss was carried out on december 31, 2011. itis usual to find a difference\'}, {\'originText\': "between the `book inventory\' and the physical stock quantities during the stock count. this", \'location\':\'361,2374,1844,46\', \'text\': "between thea book inventory\' and thea physical stock quantities during thea stock counts this"}, {\'originText\': \'difference is due to various factors such as wrong stock entries, shop lifting, breakagesand\', \'location\': \'362,2457,1842,45\', \'text\': \'difference is due to various factors such as wrong stock entries shop lifting breakages and\'}, {\'originText\': \'damages, etc. in order to correct the inventory records it is the practice of the insured to adjust\', \'location\': \'362,2541,1842,44\', \'text\':\'damages etch in order to correct thea inventory records it is thea practice ofthea insured to adjust\'}, {\'originText\': \'these differences by updating thephysical quantities in the inventory system. by this exercise,\', \'location\':\'360,2624,1842,44\', \'text\': \'these differences by updating thea physical quantities in thea inventory systems by this exerciser\'}, {\'originText\': \'theinventory records get updated and corrected at the end of each financial year.as mentioned\', \'location\': \'360,2706,1843,44\', \'text\': \'thea inventory records get updated and corrected at thea end of each financial years as mentioned\'}, {\'originText\': \'earlier, the last such exercise was carried out on 31 st december 2011, when the physical\', \'location\': \'361,2781,1843,50\', \'text\': \'earlier thea last such exercise was carried out on 31 st december 2011, when thea physical\'}, {\'originText\': \'quantities and inventory records were matched.\', \'location\': \'361,2870,909,44\', \'text\': \'quantities and inventory records were matched\'}, {\'originText\': \'page 9 of 15\', \'location\': \'1960,3165,238,44\', \'text\': \'page i of 15\'}]'
    var resPyArr = JSON.parse(temp.replace(/'/g, '"'));
    return resPyArr;
}
