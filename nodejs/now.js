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
sync.fiber(function()
{

    var pattern = /\d*[.]{1}\d*/g;
    let arr = '2013.22 drklsa1df 210124.11'.match(pattern);
    var testarr = makeData2();

    //Specific documents Before treatment
    //reqArr = convertedSpecificDocumentsBefore(testarr);
    //UY
    //reqArr = convertedUY(reqArr);
    //Entry
    //reqArr = sync.await(convertedEntry(reqArr, sync.defer()));
    //Our Share
    //reqArr = convertedOurShare(reqArr);
    //Currency Code
    //reqArr = sync.await(convertedCurrencyCode(reqArr, sync.defer()));
    //Specific documents After treatment
    reqArr = convertedSpecificDocumentsAfter(testarr);
    console.log(reqArr);
})

function convertedSpecificDocumentsBefore(reqArr) {
    //COSMOS
    if (reqArr.docCategory.DOCNAME == 'COSMOS') {
        for (var i in reqArr.data) {
            var item = reqArr.data[i];
            if (item.colLbl == 37 && item.text.toUpperCase().indexOf('CR') == -1) {
                item.text += 'DR';
            }
        }
    }

    return reqArr;
}

function convertedUY(reqArr) {
    // UY outputs only year START
    var pattern = /20\d\d/ig;
    var lastPattern = /19\d\d/ig;

    for (var i in reqArr.data) {
        var item = reqArr.data[i];

        if (item.colLbl == 2) {
            var arr;
            if (pattern.test(item.text)) {
                arr = item.text.match(pattern);
                var intArr = Math.min.apply(null, arr.map(Number));
                if (item.text != String(intArr)) {
                    item.originText = item.text;
                    item.text = String(intArr);
                }
            } else if (lastPattern.test(item.text)) {
                arr = item.text.match(lastPattern);
                var intArr = Math.min.apply(null, arr.map(Number));
                if (item.text != String(intArr)) {
                    item.originText = item.text;
                    item.text = String(intArr);
                }
            } else {
                item.colLbl = 38;
            }
        }
    }
    // UY outputs only year END
    return reqArr;
}

function convertedEntry(reqArr, done) {
    sync.fiber(function () {
        try {
            // convert char to number START
            var pattern = /O/gi;

            for (var i in reqArr.data) {
                var item = reqArr.data[i];
                if (item.colLbl == 37) {
                    var convertText = String(item.text.replace(/ /gi, '').replace(pattern, '0'));
                    if (item.text != convertText) {
                        item.originText = item.text;
                        item.text = convertText;
                    }
                } else {
                }
            }
            // convert char to number END

            // remove characters , convert to - or + START
            pattern = /[^0-9\.]+/g;
            var isMinus;
            var isContrary;
            var units = sync.await(oracle.selectEntryMappingUnit(sync.defer()));

            for (var i in reqArr.data) {
                isMinus = false;
                isContrary = false;
                var item = reqArr.data[i];
                if (item.colLbl == 37 && pattern.test(item.text)) {
                    if (item.text.indexOf('(') != -1 && item.text.indexOf(')') != -1) {
                        isMinus = true;
                    } else if (item.text.toUpperCase().indexOf('CR') != -1 || item.text.toUpperCase().indexOf('DR') != -1) {
                        for (var j in units) {
                            if (units[j].COLNUM == item.entryLbl) {
                                if ((item.text.toUpperCase().indexOf('CR') != -1 && units[j].CREDIT == '-')
                                    || (item.text.toUpperCase().indexOf('DR') != -1 && units[j].DEBIT == '-')) {
                                    isContrary = true;
                                }
                            }
                        }
                    }
                    var intArr = Number(item.text.replace(pattern, ''));
                    if (item.text != String(intArr)) {
                        item.originText = item.text;
                        item.text = ((isMinus) ? '-' : '') + String(intArr);
                        if (isContrary) {
                            if (Number(item.text) > 0) {
                                item.text = '-' + item.text;
                            } else {
                                item.text = item.text.replace(/-/gi, '');
                            }
                        }
                        
                    }
                } else {
                }
            }
            // remove characters , convert to - or + END

        } catch (e) {
            console.log(e);
        } finally {
            return done(null, reqArr);
        }
    });   
}

function convertedOurShare(reqArr) {
    // remove characters START
    var pattern = /[^0-9\.]+/g;

    for (var i in reqArr.data) {
        var item = reqArr.data[i];
        if (item.colLbl == 36 && pattern.test(item.text)) {
            var intArr = Number(item.text.replace(/ /gi,'').replace(pattern, ''));
            if (item.text != String(intArr)) {
                item.originText = item.text;
                item.text = String(intArr);
            }
        } else {
        }
    }
    // remove characters END

    return reqArr;
}

function convertedCurrencyCode(reqArr, done) {
    sync.fiber(function () {
        try {

            // convert currency code to DB data START
            for (var i in reqArr.data) {
                var item = reqArr.data[i];
                if (item.colLbl == 3) {
                    var curCds = sync.await(oracle.selectCurCd(item.text, sync.defer()));
                    if (item.text != curCds) {
                        item.originText = item.text;
                        item.text = curCds;
                    }
                }
            }
            // convert currency code to DB data END
            
        } catch (e) {
            console.log(e);
        } finally {
            return done(null, reqArr);
        }

    });
}

function convertedSpecificDocumentsAfter(reqArr) {
    // BT
    if (reqArr.docCategory.DOCNAME == 'BT') {
        var oslLocation;
        var oslMappingSid;
        var oslSid;
        var oslText;
        var yourShare;
        for (var i in reqArr.data) {
            var item = reqArr.data[i];
            if (item.entryLbl && item.entryLbl == 2) { // OSL(100%) entry
                oslLocation = item.location;
                oslMappingSid = item.mappingSid;
                oslSid = item.sid;
                oslText = item.text;
            } else if (item.colLbl == 36) { // Our Share Label
                yourShare = item.text;
            } else if (item.colLbl == 35) {
                if (isNaN(item.text)) {
                    item.colLbl = 38;
                }
            }
        }

        if (oslText && yourShare) {
            reqArr.data.push({
                'entryLbl': 3,
                'text': String(Number(Number(oslText) * (Number(yourShare) / 100)).toFixed(2)),
                'colLbl': 37,
                'location': oslLocation,
                'colAccu': 0.99,
                'mappingSid': oslMappingSid,
                'sid': oslSid
            });
        }

    }
    //china
    if (reqArr.docCategory.DOCNAME == 'CHINA ZENITH 1') {
        for (var i in reqArr.data) {
            var item = reqArr.data[i];
            if (item.entryLbl && item.entryLbl == 35) { // your reference
                console.log('dd');
            }
        }
    }

    
    return reqArr;
}

function makeData2 () {
    var temp = '{"docCategory":{"SEQNUM":156,"DOCNAME":"MARSH_03","DOCSCORE":0.99,"SAMPLEIMAGEPATH":"/sampleDocImage/99.jpg","DOCTYPE":99},"data":[{"colLbl":"38","originText":"GUY CARPENTER","location":"259,122,489,46","mappingSid":"99,342,153,989,85366,85367,0,0,0","colAccu":0.34,"sid":"85366,85367,0,0,0","text":"GUY CARPENTER"},{"colLbl":"38","location":"1091,126,304,22","mappingSid":"99,1443,158,1845,85366,85367,83116,83163,0","colAccu":0.34,"sid":"85366,85367,83116,83163,0","text":"Guy Carpenter & Company Ltd"},{"colLbl":"38","location":"1092,156,294,19","mappingSid":"99,1444,195,1833,83143,83136,86714,83832,0","colAccu":0.34,"sid":"83143,83136,86714,83832,0","text":"Grove House Newland Street"},{"colLbl":"38","location":"1092,188,147,20","mappingSid":"99,1444,235,1638,83140,85523,0,0,0","colAccu":0.34,"sid":"83140,85523,0,0,0","text":"Witham, Essex"},{"colLbl":"38","location":"1092,217,95,19","mappingSid":"99,1444,272,1570,86715,86716,0,0,0","colAccu":0.34,"sid":"86715,86716,0,0,0","text":"CM8 2UP"},{"colLbl":"38","location":"1092,248,357,19","mappingSid":"99,1444,311,1916,85960,0,84083,83150,85960","colAccu":0.34,"sid":"85960,0,84083,83150,85960","text":"020 7357 1000 Fax 020 7357 2164"},{"colLbl":"38","location":"1091,282,181,20","mappingSid":"99,1443,353,1682,0,0,0,0,0","colAccu":0.34,"sid":"0,0,0,0,0","text":"www.guycarp.com"},{"colLbl":"38","location":"182,432,433,24","mappingSid":"99,240,541,813,83076,82987,83116,0,0","colAccu":0.34,"sid":"83076,82987,83116,0,0","text":"Korean Reinsurance Company"},{"colLbl":35,"location":"1213,432,131,19","mappingSid":"99,1604,541,1777,0,0,0,0,0","colAccu":0.99,"sid":"0,0,0,0,0","text":"XNE40217"},{"colLbl":38,"location":"930,433,194,18","mappingSid":"99,1230,543,1486,83398,82993,0,0,0","colAccu":0.99,"sid":"83398,82993,0,0,0","text":"Contract No."},{"colLbl":"38","location":"184,457,346,23","mappingSid":"99,243,573,701,83290,83076,83078,84290,0","colAccu":0.34,"sid":"83290,83076,83078,84290,0","text":"9F Korean Re Building"},{"colLbl":"38","location":"931,457,413,20","mappingSid":"99,1231,573,1777,86713,83142,0,0,0","colAccu":0.34,"sid":"86713,83142,0,0,0","text":"Transaction Ref: ADJ 0002"},{"colLbl":"38","location":"183,481,474,24","mappingSid":"99,242,603,869,85005,83791,83294,83291,83292","colAccu":0.34,"sid":"85005,83791,83294,83291,83292","text":"Jongno 5 Gil 68 (SusongDong)"},{"colLbl":"38","location":"932,482,175,22","mappingSid":"99,1232,604,1464,83121,83142,83169,0,0","colAccu":0.34,"sid":"83121,83142,83169,0,0","text":"Your Ref (s)"},{"colLbl":"38","location":"1215,483,49,17","mappingSid":"99,1607,605,1671,0,0,0,0,0","colAccu":0.34,"sid":"0,0,0,0,0","text":"TBA"},{"colLbl":"38","location":"930,505,232,22","mappingSid":"99,1230,633,1537,0,86515,85185,0,82945","colAccu":0.34,"sid":"0,86515,85185,0,82945","text":"Cont ac t/ eMai I"},{"colLbl":"38","location":"1232,506,245,25","mappingSid":"99,1629,634,1953,0,0,0,0,0","colAccu":0.34,"sid":"0,0,0,0,0","text":"oanne.phi11ips@"},{"colLbl":"38","location":"183,508,147,23","mappingSid":"99,242,637,436,85007,0,0,0,0","colAccu":0.34,"sid":"85007,0,0,0,0","text":"Jongnogu"},{"colLbl":"38","location":"182,531,181,20","mappingSid":"99,240,666,480,83296,83298,0,0,0","colAccu":0.34,"sid":"83296,83298,0,0,0","text":"Seoul 03151"},{"colLbl":"38","location":"1216,535,184,21","mappingSid":"99,1608,671,1851,0,82915,0,0,0","colAccu":0.34,"sid":"0,82915,0,0,0","text":"guycarp . com"},{"colLbl":"38","location":"1216,555,178,21","mappingSid":"99,1608,696,1843,1,1,1,1,1","colAccu":0.34,"sid":"1,1,1,1,1","text":"01376506574"},{"colLbl":"38","location":"931,557,210,24","mappingSid":"99,1231,698,1509,84122,82993,0,0,0","colAccu":0.34,"sid":"84122,82993,0,0,0","text":"Telephone No :"},{"colLbl":"38","location":"182,558,181,18","mappingSid":"99,240,699,480,85667,83297,0,0,0","colAccu":0.34,"sid":"85667,83297,0,0,0","text":"South Korea"},{"colLbl":"38","location":"932,583,362,17","mappingSid":"99,1232,731,1711,82983,0,0,82974,0","colAccu":0.34,"sid":"82983,0,0,82974,0","text":"Date : 17th April 2018"},{"colLbl":"38","location":"645,633,418,18","mappingSid":"99,853,794,1406,0,84677,83823,0,0","colAccu":0.34,"sid":"0,84677,83823,0,0","text":"ADJUST>ENI CLOSING ADVICE"},{"colLbl":0,"location":"416,681,364,21","mappingSid":"99,550,854,1031,0,0,84276,0,0","colAccu":0.99,"sid":"0,0,84276,0,0","text":"Ennia Cari be Schade NV"},{"colLbl":"38","location":"182,682,149,19","mappingSid":"99,240,855,437,83354,0,0,0,0","colAccu":0.34,"sid":"83354,0,0,0,0","text":"Reinsured"},{"colLbl":0,"location":"416,705,613,23","mappingSid":"99,550,884,1361,84170,83229,0,0,83952","colAccu":0.99,"sid":"84170,83229,0,0,83952","text":"Fire and Allied Perils Excess of Loss"},{"colLbl":"38","location":"181,708,133,18","mappingSid":"99,239,888,415,83398,0,0,0,0","colAccu":0.34,"sid":"83398,0,0,0,0","text":"Contract"},{"colLbl":38,"location":"413,731,316,25","mappingSid":"99,546,916,964,0,83047,84030,0,0","colAccu":0.99,"sid":"0,83047,84030,0,0","text":"Various As Per Slip"},{"colLbl":"38","location":"181,732,99,19","mappingSid":"99,239,918,370,84028,0,0,0,0","colAccu":0.34,"sid":"84028,0,0,0,0","text":"Limits"},{"colLbl":2,"location":"416,755,394,23","mappingSid":"99,550,947,1071,0,82903,84943,0,0","colAccu":0.99,"sid":"0,82903,84943,0,0","text":"2017","originText":"01/03/2017 TO 31/12/2017"},{"colLbl":"38","location":"182,756,98,20","mappingSid":"99,240,948,370,83355,0,0,0,0","colAccu":0.34,"sid":"83355,0,0,0,0","text":"Period"},{"colLbl":38,"location":"182,830,446,22","mappingSid":"99,240,1041,830,82880,0,83047,83249,0","colAccu":0.99,"sid":"82880,0,83047,83249,0","text":"PREMIUM ADJ. AS AT 31/12/17"},{"colLbl":"38","location":"796,882,52,19","mappingSid":"99,1052,1106,1121,0,0,0,0,0","colAccu":0.34,"sid":"0,0,0,0,0","text":"ANG"},{"colLbl":"38","location":"181,908,48,19","mappingSid":"99,239,1139,302,0,0,0,0,0","colAccu":0.34,"sid":"0,0,0,0,0","text":"NPT"},{"colLbl":"38","location":"180,932,364,23","mappingSid":"99,238,1169,719,0,0,83249,0,0","colAccu":0.34,"sid":"0,0,83249,0,0","text":"Adj ustble at 0.00702%"},{"colLbl":"38","location":"732,932,58,23","mappingSid":"99,968,1169,1044,1,1,1,1,1","colAccu":0.34,"sid":"1,1,1,1,1","text":"769,"},{"colLbl":"38","location":"181,956,299,20","mappingSid":"99,239,1199,634,82916,0,82890,0,0","colAccu":0.34,"sid":"82916,0,82890,0,0","text":"Less Previous Paid"},{"colLbl":"38","location":"733,957,163,23","mappingSid":"99,969,1200,1185,83055,0,0,0,0","colAccu":0.34,"sid":"83055,0,0,0,0","text":"616, 640.00"},{"colLbl":"38","location":"731,1008,164,21","mappingSid":"99,966,1264,1183,1,1,1,1,1","colAccu":0.34,"sid":"1,1,1,1,1","text":"152,802.80"},{"colLbl":"38","location":"182,1032,147,23","mappingSid":"99,240,1294,435,82895,0,0,0,0","colAccu":0.34,"sid":"82895,0,0,0,0","text":"Brokerage"},{"colLbl":"38","location":"749,1032,147,22","mappingSid":"99,990,1294,1185,1,1,1,1,1","colAccu":0.34,"sid":"1,1,1,1,1","text":"15,280.28"},{"colLbl":3,"location":"797,1147,49,18","mappingSid":"99,1054,1438,1119,82893,0,0,0,0","colAccu":0.99,"sid":"82893,0,0,0,0","text":"USD"},{"colLbl":"38","location":"182,1178,168,21","mappingSid":"99,240,1477,462,83121,83024,0,0,0","colAccu":0.34,"sid":"83121,83024,0,0,0","text":"Your Share"},{"colLbl":"38","location":"766,1184,130,22","mappingSid":"99,1013,1485,1185,82917,0,0,0,0","colAccu":0.34,"sid":"82917,0,0,0,0","text":"1, 133.43"},{"colLbl":"38","location":"184,1224,111,18","mappingSid":"99,243,1535,390,1,1,1,1,1","colAccu":0.34,"sid":"1,1,1,1,1","text":"1.5000%"},{"colLbl":"38","location":"182,1356,665,24","mappingSid":"99,240,1701,1120,83226,84677,83823,0,84276","colAccu":0.34,"sid":"83226,84677,83823,0,84276","text":"This Closing Advice i,vi11 be settled in U"},{"colLbl":"38","location":"915,1356,560,20","mappingSid":"99,1210,1701,1951,86523,83029,82932,83131,82980","colAccu":0.34,"sid":"86523,83029,82932,83131,82980","text":"DOLLARS in a statement of account,"},{"colLbl":"38","location":"182,1731,598,24","mappingSid":"99,240,2171,1031,0,0,82903,86156,83216","colAccu":0.34,"sid":"0,0,82903,86156,83216","text":"Subi ect to collection from Reinsured"},{"colLbl":"38","location":"182,1781,1330,25","mappingSid":"99,240,2234,2000,83104,84130,83101,83398,0","colAccu":0.34,"sid":"83104,84130,83101,83398,0","text":"Please quote our Contract Nurnber and Transaction Referenceon all correspondence"},{"colLbl":"38","location":"206,2200,640,17","mappingSid":"99,272,2759,1119,85366,85367,83116,83134,84281","colAccu":0.34,"sid":"85366,85367,83116,83134,84281","text":"Guy Carpenter & Company Limited Registered in Eng!end end Weles Numbec 335308"},{"colLbl":"38","location":"208,2219,670,19","mappingSid":"99,275,2783,1161,84281,82917,86546,0,86546","colAccu":0.34,"sid":"84281,82917,86546,0,86546","text":"Registered 1 Tower Westg Tower Place, London EC3R5BU United King-om"},{"colLbl":"38","location":"206,2256,902,20","mappingSid":"99,272,2830,1465,0,0,0,82980,83152","colAccu":0.34,"sid":"0,0,0,82980,83152","text":"Ah appointed representative of Marsh Ltd Marsh Ltd authoneedand regulated by; the Financid Conduct Authoriy (FCA)"}],"docSid":"85366,85367,0,0,0,85366,85367,83116,83163,0,83143,83136,86714,83832,0,83140,85523,0,0,0,86715,86716,0,0,0"}'
    var resPyArr = JSON.parse(temp.replace(/'/g, '"'));
    return resPyArr;
}
