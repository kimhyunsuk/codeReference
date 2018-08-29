var fs = require('fs'),
    readline = require('readline'),
    stream = require('stream');
var oracledb = require('oracledb');
var appRoot = require('app-root-path').path;
var dbConfig = require(appRoot + '/config/dbConfig');
const XLSX = require('xlsx');
oracledb.autoCommit = true;

var buf = fs.readFileSync("./sampleData/largedata.xlsx");
var wb = XLSX.read(buf, {type:'buffer'});
console.log(wb)

var instream = fs.createReadStream('./sampleData/largedata.xlsx');
var outstream = new stream;
outstream.readable = true;
outstream.writable = true;

var rl = readline.createInterface({
    input: instream,
    output: outstream,
    terminal: false
});

oracledb.getConnection(dbConfig,
    function (err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        try {
            var arr = new Array();

            instream.on('data', function( arraybuffer ){
                var data = new Uint8Array(arraybuffer);
                for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
              });
              instream.on('end', function(){
                var bstr = arr.join("");
                var workbook = XLSX.read(bstr, {type:"binary"});
                console.log(workbook)
              });



            rl.on('line', function (line) {
                var arr = line.split('\t')
                console.log(arr[0]);

                if (!isNaN(arr[0])) {
                    rl.write(
                        connection.execute(
                            `INSERT INTO tbl_batch_answer_data (
                            imgId, imgFileStartNo, imgFileEndNo, entryNo, statementDiv, contractNum, ogCompanyCode, ogCompanyName, brokerCode, brokerName,
                            ctnm, insstdt, insenddt, uy, curcd, paidpercent, paidshare, oslpercent, oslshare, grosspm, pm, pmpfend, pmpfwos, xolpm,
                            returnpm, grosscn, cn, profitcn, brokerage, tax, overridingcom, charge, pmreservertd1, pfpmreservertd1, pmreservertd2, pfpmreservertd2,
                            claim, lossrecovery, cashloss, cashlossrd, lossrr, lossrr2, losspfend, losspfwoa, interest, taxon, miscellaneous, pmbl,
                            cmbl, ntbl, cscosarfrncnnt2
                        ) VALUES (
                            :imgId, :imgfilestartno, :imgfileendno, :entryno, :statementdiv, :contractnum, :ogcompanycode, :ogcompanyname, :brokercode, :brokername,
                            :ctnm, :insstdt, :insenddt, :uy, :curcd, :paidpercent, :paidshare, :oslpercent, :oslshare, :grosspm, :pm, :pmpfend, :pmpfwos, :xolpm,
                            :returnpm, :grosscn, :cn, :profitcn, :brokerage, :tax, :overridingcom, :charge, :pmreservertd1, :pfpmreservertd1, :pmreservertd2, :pfpmreservertd2,
                            :claim, :lossrecovery, :cashloss, :cashlossrd, :lossrr, :lossrr2, :losspfend, :losspfwoa, :interest, :taxon, :miscellaneous, :pmbl,
                            :cmbl, :ntbl, :cscosarfrncnnt2
                        ) `
                            , [arr]
                            ,
                            function (err) {
                                if (err) {
                                    console.log(err.message);
                                    return;
                                }
                                connection.commit(function (err) {
                                    if (err) {
                                        console.log(err.message);
                                        return;
                                    }
                                })
                            })
                    );
                }
            });
        } catch (e) {
            console.log(e);
        }

    });
