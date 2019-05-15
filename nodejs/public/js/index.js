"use strict";
var canvas;

var ctx;

var arRectangle = new Array();

var sx, sy;                  // 드래그 시작점

var ex, ey;                  // 드래그 끝점

var color;               // 현재 색상

var drawing;                // 그리고 있는 중인가

var moving = -1;              // 이동중인 도형 첨자

$(document).on('ready', function(){

    $('#uploadFile').on('change', function(){
        $('#uploadFileForm').submit();
    })

    $('#uploadFileForm').ajaxForm({
        beforeSubmit: function (data, frm, opt) {
            var canvas = document.createElement('canvas');
            canvas.id = "myCanvas";

            canvas.width = 2481 * 0.4;
            canvas.height = 3508 * 0.4;
            // canvas.width = 2481;
            // canvas.height = 3508;

            var ctx = canvas.getContext("2d");
            ctx.fillStyle = "#FFFFCC";
            $('#canversDiv').append(canvas);
            var temp = '[{"location": "-5,-14,17,62", "text": "("}, {"location": "17,-14,247,62", "text": "A밧차107호"}, {"location": "304,-14,91,62", "text": "다음"}, {"location": "404,-14,17,62", "text": ")"}, {"location": "433,-14,132,62", "text": "납품서"}, {"location": "578,-14,188,62", "text": "일련번호"}, {"location": "793,-14,70,62", "text": "245"}, {"location": "896,-14,141,62", "text": "당일계"}, {"location": "1040,-14,17,62", "text": "="}, {"location": "1066,-14,17,62", "text": "1"}, {"location": "1091,-14,17,62", "text": ","}, {"location": "1114,-14,98,62", "text": "438"}, {"location": "1505,-11,60,65", "text": "5번"}, {"location": "1595,-11,18,65", "text": "문"}, {"location": "471,341,155,58", "text": "인증번호"}, {"location": "639,327,16,58", "text": ":"}, {"location": "715,321,16,58", "text": "제"}, {"location": "749,318,188,59", "text": "053"}, {"location": "983,298,269,60", "text": "강도콘크리트"}, {"location": "479,127,348,84", "text": "레디믹스트"}, {"location": "876,127,281,84", "text": "콘크리트"}, {"location": "1198,127,205,84", "text": "납품서"}, {"location": "1501,127,24,84", "text": "("}, {"location": "1556,127,133,84", "text": "납품서"}, {"location": "1733,127,24,84", "text": ")"}, {"location": "465,246,165,58", "text": "표준번호"}, {"location": "641,246,16,58", "text": ":"}, {"location": "698,246,74,58", "text": "KS"}, {"location": "806,246,16,58", "text": "F"}, {"location": "862,246,111,58", "text": "4009"}, {"location": "475,295,52,48", "text": "종류"}, {"location": "543,295,13,47", "text": "·"}, {"location": "574,294,61,48", "text": "등급"}, {"location": "643,294,13,47", "text": ":"}, {"location": "705,293,78,47", "text": "보통"}, {"location": "817,292,68,47", "text": "포장"}, {"location": "893,291,13,47", "text": "."}, {"location": "903,291,13,47", "text": "."}, {"location": "912,291,13,47", "text": "."}, {"location": "940,290,293,48", "text": "고강도콘크리트"}, {"location": "1514,265,95,74", "text": "No2"}, {"location": "1681,265,21,74", "text": "-"}, {"location": "1754,265,55,74", "text": "42"}, {"location": "1812,265,21,74", "text": "."}, {"location": "466,374,163,58", "text": "인증기관"}, {"location": "643,374,16,58", "text": ":"}, {"location": "708,374,279,58", "text": "한국표준협회"}, {"location": "1290,369,107,70", "text": "2019"}, {"location": "1470,369,20,70", "text": "년"}, {"location": "1525,369,51,70", "text": "04"}, {"location": "1647,369,20,70", "text": "월"}, {"location": "1709,369,53,70", "text": "08"}, {"location": "1825,369,20,70", "text": "일"}, {"location": "1458,459,432,73", "text": "안양레미콘주식회사"}, {"location": "8,495,269,80", "text": "대림산업"}, {"location": "288,495,23,80", "text": "("}, {"location": "345,495,23,80", "text": "주"}, {"location": "395,495,23,80", "text": ")"}, {"location": "682,511,89,54", "text": "귀하"}, {"location": "-15,619,26,89", "text": "|"}, {"location": "84,619,26,89", "text": "납"}, {"location": "219,619,26,89", "text": "품"}, {"location": "354,619,26,89", "text": "장"}, {"location": "489,619,26,89", "text": "소"}, {"location": "581,619,249,89", "text": "대림산업"}, {"location": "858,619,26,89", "text": "("}, {"location": "903,619,26,89", "text": "주"}, {"location": "966,619,26,89", "text": ")"}, {"location": "993,619,26,89", "text": "-"}, {"location": "1020,619,645,89", "text": "e편한세상보라매2차"}, {"location": "88,725,18,65", "text": "운"}, {"location": "187,725,18,65", "text": "반"}, {"location": "293,725,18,65", "text": "차"}, {"location": "392,725,18,65", "text": "번"}, {"location": "491,725,18,65", "text": "호"}, {"location": "850,717,20,70", "text": "|"}, {"location": "894,717,38,70", "text": "14"}, {"location": "942,717,20,70", "text": "-"}, {"location": "969,717,101,70", "text": "7620"}, {"location": "1137,717,20,70", "text": "("}, {"location": "1160,717,107,70", "text": "0216"}, {"location": "1283,717,20,70", "text": ")"}, {"location": "350,818,17,59", "text": "|"}, {"location": "422,818,17,59", "text": "출"}, {"location": "506,818,17,59", "text": "발"}, {"location": "595,809,18,65", "text": "|"}, {"location": "781,809,36,65", "text": "16"}, {"location": "1242,809,18,65", "text": "시"}, {"location": "1471,809,48,65", "text": "18"}, {"location": "1671,809,18,65", "text": "분"}, {"location": "68,866,15,54", "text": "납"}, {"location": "150,866,15,54", "text": "품"}, {"location": "211,866,15,54", "text": "시"}, {"location": "288,866,15,54", "text": "각"}, {"location": "365,866,15,54", "text": "-"}, {"location": "353,919,12,43", "text": "|"}, {"location": "423,916,12,43", "text": "도"}, {"location": "507,914,12,43", "text": "착"}, {"location": "888,912,18,63", "text": "|"}, {"location": "1055,912,225,63", "text": "70시"}, {"location": "93,998,16,58", "text": "납"}, {"location": "229,998,16,58", "text": "품"}, {"location": "359,998,16,58", "text": "용"}, {"location": "494,998,16,58", "text": "적"}, {"location": "1047,1003,14,50", "text": "|"}, {"location": "1113,1003,14,50", "text": "누"}, {"location": "1251,1003,14,50", "text": "계"}, {"location": "333,1081,185,46", "text": "콘크리트의"}, {"location": "1076,1077,156,48", "text": "호칭강도"}, {"location": "1331,1072,124,41", "text": "슬럼프"}, {"location": "1484,1076,76,41", "text": "또는"}, {"location": "1643,1079,108,44", "text": "시멘트"}, {"location": "1780,1079,107,44", "text": "종류에"}, {"location": "68,1114,15,54", "text": "호"}, {"location": "156,1114,15,54", "text": "칭"}, {"location": "664,1108,114,42", "text": "치수에"}, {"location": "796,1108,77,42", "text": "따른"}, {"location": "890,1108,77,42", "text": "구분"}, {"location": "1332,1103,124,48", "text": "즐럼프"}, {"location": "1481,1103,88,48", "text": "플로"}, {"location": "281,1133,111,46", "text": "종류에"}, {"location": "408,1133,67,46", "text": "따른"}, {"location": "502,1133,67,46", "text": "구분"}, {"location": "1098,1135,11,41", "text": "("}, {"location": "1101,1135,94,41", "text": "MPa"}, {"location": "1194,1135,11,41", "text": ")"}, {"location": "1651,1135,113,44", "text": "따른"}, {"location": "1771,1135,97,44", "text": "구분"}, {"location": "68,1205,18,65", "text": "방"}, {"location": "154,1205,18,65", "text": "법"}, {"location": "207,1205,18,65", "text": "|"}, {"location": "252,1205,315,65", "text": "보통콘크리트"}, {"location": "751,1206,60,54", "text": "25"}, {"location": "1032,1198,17,62", "text": "|"}, {"location": "1069,1198,69,62", "text": "21"}, {"location": "1284,1198,17,62", "text": "|"}, {"location": "1399,1202,66,59", "text": "150"}, {"location": "1577,1199,343,59", "text": "보통포틀랜드1종"}, {"location": "485,763,42,11", "text": "호"}, {"location": "485,801,42,11", "text": "|"}, {"location": "485,840,42,11", "text": "발"}, {"location": "485,892,42,11", "text": "|"}, {"location": "485,939,42,11", "text": "착"}, {"location": "1512,988,70,46", "text": "252"}, {"location": "1871,1011,8,31", "text": "m"}, {"location": "47,1070,43,12", "text": "-"}, {"location": "657,1074,218,35", "text": "굵은골재의"}, {"location": "895,1074,78,35", "text": "최대"}, {"location": "764,1149,8,31", "text": "("}, {"location": "770,1149,64,31", "text": "mm"}, {"location": "854,1149,8,31", "text": ")"}, {"location": "1395,1151,8,29", "text": "("}, {"location": "1421,1151,64,29", "text": "mm"}, {"location": "1488,1151,8,29", "text": ")"}, {"location": "800,1314,15,54", "text": "배"}, {"location": "866,1314,15,54", "text": "합"}, {"location": "932,1314,15,54", "text": "표"}, {"location": "982,1314,15,54", "text": "("}, {"location": "1024,1314,40,54", "text": "kg"}, {"location": "1075,1314,15,54", "text": "/"}, {"location": "1107,1314,40,54", "text": "m²"}, {"location": "1147,1314,15,54", "text": ")"}, {"location": "1180,1314,15,54", "text": "|"}, {"location": "-5,1385,21,74", "text": "|"}, {"location": "46,1385,135,74", "text": "시멘트①"}, {"location": "182,1385,21,74", "text": "|"}, {"location": "233,1385,136,74", "text": "시멘트②"}, {"location": "377,1385,21,74", "text": "|"}, {"location": "418,1385,135,74", "text": "시멘트③"}, {"location": "565,1385,21,74", "text": "]"}, {"location": "670,1385,21,74", "text": "물"}, {"location": "767,1385,21,74", "text": "|"}, {"location": "823,1385,95,74", "text": "회수수"}, {"location": "998,1385,143,74", "text": "잔골재①"}, {"location": "1190,1385,146,74", "text": "잔골재②"}, {"location": "1388,1385,133,74", "text": "잔골재③"}, {"location": "1568,1385,115,74", "text": "굵은골재"}, {"location": "1682,1385,21,74", "text": "("}, {"location": "1697,1385,21,74", "text": "②"}, {"location": "1756,1385,165,74", "text": "굵은골재②"}, {"location": "1907,1385,21,74", "text": ")"}, {"location": "32,1499,63,44", "text": "250"}, {"location": "572,1501,12,44", "text": "|"}, {"location": "614,1499,69,44", "text": "166"}, {"location": "1197,1500,60,42", "text": "904"}, {"location": "1583,1502,68,40", "text": "922"}, {"location": "27,1577,185,48", "text": "굵은골재이"}, {"location": "221,1577,110,48", "text": "혼화재"}, {"location": "348,1577,13,48", "text": "①"}, {"location": "382,1577,13,48", "text": "|"}, {"location": "417,1577,142,48", "text": "혼화재②"}, {"location": "573,1577,13,48", "text": "|"}, {"location": "609,1577,141,48", "text": "혼화재③"}, {"location": "765,1577,13,48", "text": "|"}, {"location": "800,1577,150,48", "text": "혼화제①"}, {"location": "961,1577,13,48", "text": "|"}, {"location": "991,1577,102,48", "text": "혼화제"}, {"location": "1112,1577,13,48", "text": "②"}, {"location": "1156,1577,13,48", "text": "|"}, {"location": "1187,1577,102,48", "text": "혼화제"}, {"location": "1308,1577,13,48", "text": "③"}, {"location": "1343,1577,13,48", "text": "|"}, {"location": "1378,1577,109,48", "text": "혼화제"}, {"location": "1499,1577,13,48", "text": "④"}, {"location": "1539,1577,13,48", "text": "|"}, {"location": "1569,1577,102,48", "text": "혼화제"}, {"location": "1691,1577,13,48", "text": "⑤"}, {"location": "1725,1577,13,48", "text": "|"}, {"location": "1765,1577,102,48", "text": "혼화제"}, {"location": "1887,1577,13,48", "text": "⑥"}, {"location": "186,1676,18,64", "text": "|"}, {"location": "253,1676,47,64", "text": "31"}, {"location": "384,1676,18,64", "text": "|"}, {"location": "451,1676,35,64", "text": "31"}, {"location": "1003,1677,13,48", "text": "2"}, {"location": "1028,1677,13,48", "text": "."}, {"location": "1052,1677,13,48", "text": "5"}, {"location": "76,1751,13,46", "text": "물"}, {"location": "138,1753,174,46", "text": "결합재비"}, {"location": "343,1761,13,46", "text": "|"}, {"location": "388,1763,42,46", "text": "53"}, {"location": "442,1765,13,46", "text": "."}, {"location": "475,1766,13,46", "text": "2"}, {"location": "742,1753,163,48", "text": "잔골재율"}, {"location": "1048,1765,40,44", "text": "49"}, {"location": "1100,1764,12,43", "text": "."}, {"location": "1126,1763,12,43", "text": "7"}, {"location": "1249,1760,12,43", "text": "%"}, {"location": "1303,1758,64,43", "text": "단위"}, {"location": "1387,1756,92,43", "text": "슬러지"}, {"location": "1502,1753,129,43", "text": "고형분율"}, {"location": "34,1847,85,46", "text": "비고"}, {"location": "126,1847,13,46", "text": ")"}, {"location": "170,1847,132,46", "text": "배합의"}, {"location": "330,1847,85,46", "text": "종별"}, {"location": "441,1847,93,46", "text": "VO"}, {"location": "546,1847,186,46", "text": "시방배합"}, {"location": "-6,1925,18,65", "text": "|"}, {"location": "21,1925,148,65", "text": "염화물"}, {"location": "202,1925,83,65", "text": "함량"}, {"location": "423,1925,18,65", "text": "0"}, {"location": "449,1925,18,65", "text": "."}, {"location": "474,1925,108,65", "text": "30g"}, {"location": "581,1925,18,65", "text": "/"}, {"location": "614,1925,18,65", "text": "m"}, {"location": "684,1925,84,65", "text": "이하"}, {"location": "930,1931,193,48", "text": "공기량"}, {"location": "234,2033,13,46", "text": "1"}, {"location": "253,2033,13,46", "text": "."}, {"location": "292,2033,125,46", "text": "고성능"}, {"location": "425,2033,171,46", "text": "AE감수제"}, {"location": "1588,2037,92,47", "text": "혼화재"}, {"location": "1,2068,12,45", "text": "|"}, {"location": "57,2068,12,45", "text": "지"}, {"location": "118,2068,83,45", "text": "정사"}, {"location": "250,2068,12,45", "text": "항"}, {"location": "1319,2068,14,49", "text": "※"}, {"location": "1350,2070,112,49", "text": "치환율"}, {"location": "1469,2077,14,49", "text": "="}, {"location": "1524,2080,220,50", "text": "시멘트혼화재"}, {"location": "1754,2070,9,33", "text": "-"}, {"location": "1778,2070,9,33", "text": "×"}, {"location": "1804,2070,76,33", "text": "1000"}, {"location": "286,2106,16,58", "text": "|"}, {"location": "331,2106,210,58", "text": "플라이애시"}, {"location": "576,2106,33,58", "text": "10"}, {"location": "610,2106,16,58", "text": "%"}, {"location": "640,2106,16,58", "text": ","}, {"location": "664,2106,395,58", "text": "고로슬래그미분말10"}, {"location": "1065,2106,16,58", "text": "%"}, {"location": "1089,2106,85,58", "text": "치환"}, {"location": "1191,2154,173,76", "text": "관고시"}, {"location": "1530,2166,180,77", "text": "it"}, {"location": "1400,1902,104,67", "text": "감15"}, {"location": "1531,1920,19,66", "text": "±"}, {"location": "1586,1927,19,66", "text": "1"}, {"location": "1606,1930,19,66", "text": "."}, {"location": "1633,1933,19,66", "text": "5"}, {"location": "1653,1936,19,66", "text": "%"}, {"location": "1677,1938,183,67", "text": "Galaw"}, {"location": "1457,2278,16,26", "text": "1"}, {"location": "1611,2278,16,26", "text": "1"}, {"location": "40,2289,111,46", "text": "인수자"}, {"location": "190,2289,76,46", "text": "확인"}, {"location": "964,2278,7,26", "text": "|"}, {"location": "1027,2278,117,26", "text": "출하계"}, {"location": "1183,2278,7,26", "text": "및"}, {"location": "1251,2278,7,26", "text": "|"}, {"location": "988,2307,153,42", "text": "표시사항"}, {"location": "1165,2307,77,42", "text": "확인"}, {"location": "1485,2314,41,11", "text": "김"}, {"location": "1537,2316,43,12", "text": "종"}, {"location": "515,2331,156,35", "text": "VAL"}, {"location": "1207,2440,11,42", "text": "※"}, {"location": "1253,2440,144,42", "text": "출하계의"}, {"location": "1417,2440,107,42", "text": "날인이"}, {"location": "1543,2440,62,42", "text": "없는"}, {"location": "1629,2440,62,42", "text": "것은"}, {"location": "1720,2440,114,42", "text": "무효임"}, {"location": "1252,2484,70,42", "text": "위의"}, {"location": "1338,2484,108,42", "text": "물품을"}, {"location": "1469,2484,169,42", "text": "납품합니다"}, {"location": "1642,2484,11,42", "text": "."}, {"location": "-10,2424,38,40", "text": "11"}, {"location": "22,2424,11,40", "text": "."}, {"location": "50,2424,121,40", "text": "레미콘에"}, {"location": "186,2424,118,40", "text": "계약외의"}, {"location": "321,2424,147,40", "text": "혼화재료를"}, {"location": "485,2424,147,40", "text": "첨가하거나"}, {"location": "655,2424,119,40", "text": "현장에서"}, {"location": "791,2424,80,40", "text": "가수를"}, {"location": "893,2424,52,40", "text": "하는"}, {"location": "963,2424,52,40", "text": "경우"}, {"location": "-7,2470,9,35", "text": "1"}, {"location": "57,2469,89,36", "text": "품질을"}, {"location": "166,2468,113,36", "text": "보증할수"}, {"location": "299,2467,112,35", "text": "없습니다"}, {"location": "416,2466,9,35", "text": "."}, {"location": "-12,2509,37,34", "text": "12"}, {"location": "26,2509,9,34", "text": "."}, {"location": "51,2509,130,34", "text": "레미콘은"}, {"location": "195,2509,221,34", "text": "강알칼리성이기"}, {"location": "439,2509,87,34", "text": "때문에"}, {"location": "544,2509,87,34", "text": "피부나"}, {"location": "656,2509,56,34", "text": "눈에"}, {"location": "731,2509,88,34", "text": "접촉할"}, {"location": "841,2509,56,34", "text": "경우"}, {"location": "896,2509,9,34", "text": ","}, {"location": "929,2509,87,34", "text": "염증을"}, {"location": "60,2548,89,38", "text": "일으킬"}, {"location": "171,2548,10,38", "text": "수"}, {"location": "208,2548,114,38", "text": "있습니다"}, {"location": "320,2548,10,38", "text": "."}, {"location": "348,2548,56,38", "text": "눈에"}, {"location": "422,2548,81,38", "text": "들어간"}, {"location": "523,2548,113,38", "text": "경우에는"}, {"location": "660,2548,56,38", "text": "즉시"}, {"location": "734,2548,81,38", "text": "깨끗한"}, {"location": "835,2548,56,38", "text": "물로"}, {"location": "913,2548,10,38", "text": "잘"}, {"location": "949,2548,50,38", "text": "닦고"}, {"location": "61,2586,119,42", "text": "전문의의"}, {"location": "199,2586,79,42", "text": "진찰을"}, {"location": "304,2586,47,42", "text": "받아"}, {"location": "370,2586,113,42", "text": "주십시오"}, {"location": "490,2586,11,42", "text": "."}, {"location": "1091,2544,69,95", "text": "NO"}, {"location": "1214,2544,313,95", "text": "안양레미콘"}, {"location": "1531,2544,246,95", "text": "주식회사"}, {"location": "-8,2659,12,44", "text": "|"}, {"location": "37,2659,12,44", "text": "A"}, {"location": "84,2659,119,44", "text": "반드시"}, {"location": "231,2659,114,44", "text": "뒷면의"}, {"location": "363,2659,196,44", "text": "주의사항과"}, {"location": "587,2659,233,44", "text": "사용설명서를"}, {"location": "846,2659,148,44", "text": "숙지하여"}, {"location": "1021,2659,120,44", "text": "주시기"}, {"location": "1165,2659,148,44", "text": "바랍니다"}, {"location": "1320,2659,12,44", "text": "."}, {"location": "878,2810,120,47", "text": "출하실"}, {"location": "1025,2810,13,47", "text": ":"}, {"location": "1061,2810,13,47", "text": "("}, {"location": "1085,2810,80,47", "text": "031"}, {"location": "1166,2810,13,47", "text": ")"}, {"location": "1179,2810,87,47", "text": "474"}, {"location": "1282,2810,13,47", "text": "-"}, {"location": "1305,2810,125,47", "text": "7126"}, {"location": "98,2813,126,44", "text": "사무실"}, {"location": "249,2813,12,44", "text": ":"}, {"location": "285,2813,12,44", "text": "("}, {"location": "301,2813,57,44", "text": "02"}, {"location": "366,2813,12,44", "text": ")"}, {"location": "402,2813,82,44", "text": "568"}, {"location": "492,2813,12,44", "text": "-"}, {"location": "519,2813,105,44", "text": "7121"}, {"location": "632,2813,12,44", "text": "~"}, {"location": "677,2813,12,44", "text": "2"}, {"location": "282,2864,14,51", "text": "("}, {"location": "302,2864,85,51", "text": "031"}, {"location": "386,2864,14,51", "text": ")"}, {"location": "408,2864,80,51", "text": "474"}, {"location": "500,2864,14,51", "text": "-"}, {"location": "528,2864,99,51", "text": "7122"}, {"location": "646,2864,14,51", "text": "~"}, {"location": "682,2864,14,51", "text": "5"}]'
            
            var resPyArr = JSON.parse(temp.replace(/'/g, '"'));
            for(var i = 0; i < resPyArr.length; i++){
                var ocrResult = resPyArr[i];
                var location = ocrResult.location.split(',');

                ctx.fillRect((location[0] * 0.4), (location[1] * 0.4), (location[2] * 0.4), (location[3] * 0.4));
                //ctx.fillRect(location[0], location[1], location[2], location[3]);
                ctx.strokeText(ocrResult.text, (location[0] * 0.4), (location[1] * 0.4));
                //ctx.strokeText(ocrResult.text, location[0], location[1]);
            }

            $('#uploadFile').val('');

            $('#ocrLocationEduDiv').show();

            var img = canvas.toDataURL('image/png');
            $('canvas').remove();
            var appendImgHtml = '<img src="' + img + '">';
            $('#canversDiv').append(appendImgHtml);

            $('img').on('load', function(){
                $('img').imgAreaSelect({
                    handles: false,
                    onSelectEnd: function (img, selection) {
                        $('input[name="x1"]').val(selection.x1);
                        $('input[name="y1"]').val(selection.y1);
                        $('input[name="x2"]').val(selection.x2);
                        $('input[name="y2"]').val(selection.y2);            
                        $('input[name="width"]').val(selection.width);
                        $('input[name="height"]').val(selection.height);
                    }
                })   
           })
            return true;
        },
        success: function (data) {
            

            
        },
        error: function (e) {
        }
    });

    $('#addBtn').on('click', function(){
        var num = $('.contents').length + 1;
        var appendContentsHtml = '<div class="contents">' +
                '<select name="label' + num + '">' +
                '<option>Buyer</option>' +
                '<option>PO Number</option>' +
                '<option>PO Date</option>' +
                '</select> ' +
                '<input type="text" class="location" name="location' + num + '" disabled> ' +
                '<button class="saveBtn">입력</button> ' +
                '<button class="deleteBtn">삭제</button> ' +
                '</div>';
                $('#contentsWrap').append(appendContentsHtml);
    })

// 사각형 생성자

function Rectangle(sx, sy, ex, ey, color) {

    this.sx = sx;

    this.sy = sy;

    this.ex = ex;

    this.ey = ey;

    this.color = color;

}



// x, y 위치의 사각형 찾음. 없으면 -1

function getRectangle(x, y) {

    for (var i = 0;i < arRectangle.length;i++) {

        var rect = arRectangle[i];

        if (x > rect.sx && x < rect.ex && y > rect.sy && y < rect.ey) {

            return i;

        }

    }

    return -1;

}



// 화면 지우고 모든 도형을 순서대로 다 그림

function drawRects() {

    //ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0;i < arRectangle.length;i++) {

        var r = arRectangle[i];

        ctx.fillStyle = r.color;

        ctx.fillRect(r.sx, r.sy, r.ex-r.sx, r.ey-r.sy);

        ctx.strokeRect(r.sx, r.sy, r.ex-r.sx, r.ey-r.sy);

    }

}



$('#zoneDrawBtn').on('click', function() {

    canvas = document.getElementById("myCanvas");

    if (canvas == null || canvas.getContext == null) return;

    ctx = canvas.getContext("2d");

    ctx.strokeStyle = "black";

    ctx.lineWidth = 2;

    color = "rgba(255, 255, 0, 0.5)"

    ctx.fillStyle = color;

    

    canvas.onmousedown = function(e) {

        e.preventDefault();

        

        // 클릭한 좌표 구하고 그 위치에 도형이 있는지 조사

        sx = canvasX(e.clientX);

        sy = canvasY(e.clientY);

        moving = getRectangle(sx, sy);

        

        // 도형을 클릭한 것이 아니면 그리기 시작

        if (moving == -1) {

            drawing = true;

        }

    }

    

    canvas.onmousemove = function(e) {

        e.preventDefault();

        ex = canvasX(e.clientX);

        ey = canvasY(e.clientY);

        

        // 화면 다시 그리고 현재 도형 그림

        if (drawing) {

            drawRects();

            ctx.fillStyle = color;

            ctx.fillRect(sx, sy, ex-sx, ey-sy);

            ctx.strokeRect(sx, sy, ex-sx, ey-sy);

        }

        

        // 상대적인 마우스 이동 거리만큼 도형 이동

        if (moving != -1) {

            var r = arRectangle[moving];

            r.sx += (ex - sx);

            r.sy += (ey - sy);

            r.ex += (ex - sx);

            r.ey += (ey - sy);

            sx = ex;

            sy = ey;

            drawRects();

        }

    }

    

    canvas.onmouseup = function(e) {

        // 좌표 정규화해서 새로운 도형을 배열에 추가

        if (drawing) {

            var x1 = Math.min(sx, ex);

            var y1 = Math.min(sy, ey);

            var x2 = Math.max(sx, ex);

            var y2 = Math.max(sy, ey);

            
        } else {

            arRectangle.push(new Rectangle(x1, y1, x2, y2,color));
        }

        

        drawing = false;

        moving = -1;

    }            

})






var btnclear = document.getElementById("zoneClearBtn");

$('#zoneClearBtn').on('click',function(e) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    arRectangle.length = 0;

})



function canvasX(clientX) {

    var bound = canvas.getBoundingClientRect();

    var bw = 5;

    return (clientX - bound.left - bw) * (canvas.width / (bound.width - bw * 2));

}



function canvasY(clientY) {

    var bound = canvas.getBoundingClientRect();

    var bw = 5;

    return (clientY - bound.top - bw) * (canvas.height / (bound.height - bw * 2));

}
})



$(document).on('mouseover', '.location', function(){
    if($(this).val() != '') {
        var location = $(this).val().split(',');
        var ias = $('img').imgAreaSelect({ instance: true });
        ias.setSelection ( location[0] , location[1] , location[2] , location[3] , true ); 
        ias.setOptions({ show: true });
        ias.update();
    }
})

/*
$(document).on('dblclick', '#photo', function(){
        var ias = $('#photo').imgAreaSelect({ instance: true });
        ias.cancelSelection();
        ias.update();
})
*/

$(document).on('click', '.saveBtn', function(){
    var x1 = $('input[name="x1"]').val();
    var y1 = $('input[name="y1"]').val();
    var x2 = $('input[name="x2"]').val();
    var y2 = $('input[name="y2"]').val();            
    var width = $('input[name="width"]').val();
    var height = $('input[name="height"]').val();

    var location = x1 + ',' + y1 + ',' + x2 + ',' + y2;
    $(this).closest('.contents').find('.location').val(location);
})

$(document).on('click', '.deleteBtn', function(){
    $(this).closest('.contents').remove();
})

function fn_initUpload() {
    $('#ocrLocationEduDiv').hide();

    if($('#canversDiv').children('img').length != 0) {
        var ias = $('img').imgAreaSelect({ remove: true });
    }
    
    $('input').val('');
    $('#canversDiv').empty();
}


