import json
import operator

# y축 정렬
def sortArrLocation(inputArr):
    tempArr = []
    retArr = []
    for item in inputArr:
        tempArr.append((makeindex(item['location']), item))
    tempArr.sort(key=operator.itemgetter(0))
    for tempItem in tempArr:
        retArr.append(tempItem[1])
    return retArr

def makeindex(location):
    if len(location) > 0:
        temparr = location.split(",")
        for i in range(0, 5):
            if (len(temparr[0]) < 5):
                temparr[0] = '0' + temparr[0]
        return int(temparr[1] + temparr[0])
    else:
        return 999999999999


input = '[{"location":"1263,187,58,38","text":"그 ."},{"location":"182,262,136,46","text":"1-174"},{"location":"438,315,551,46","text":"레디 리스트 콘크리트 납품서"},{"location":"916,452,258,24","text":"132-81-13908"},{"location":"191,478,285,24","text":"표 준 번 호 : +6 F 40092"},{"location":"914,501,248,37","text":"주식회사 산0"},{"location":"191,508,327,23","text":"인 번 호 . 제96-03_026호"},{"location":"744,509,97,26","text":"상 호"},{"location":"191,537,294,23","text":"o인 증기 관 : 한국표준협회"},{"location":"699,557,447,34","text":"급 성 명 ! 대표이사 전 찬 7"},{"location":"191,565,438,25","text":"0인 증 종 류 , 보통.포장.고강도횬크리트"},{"location":"239,614,338,30","text":"20 18년 11 월 08일"},{"location":"196,654,196,34","text":"대림산업(주)"},{"location":"275,730,51,30","text":"013"},{"location":"197,741,26,18","text":"No"},{"location":"818,615,374,28","text":"소 경기도 남양주시 와부옵 수레로"},{"location":"699,637,32,26","text":"자,"},{"location":"600,653,50,30","text":"귀하"},{"location":"743,671,498,28","text":"대표전화 031-576-4545 출하실 031-576-3131"},{"location":"778,731,315,51","text":"타설완료 0 시국"},{"location":"196,792,478,49","text":"납 품 장소 1고덕대림아파트현장"},{"location":"195,871,132,25","text":"운반차번호"},{"location":"196,968,131,26","text":"납품 시끽"},{"location":"452,868,284,31","text":"(175) 서을14다7478픁"},{"location":"585,933,31,27","text":"08"},{"location":"709,936,23,25","text":"시"},{"location":"850,933,31,26","text":"03"},{"location":"370,1001,91,26","text":"도 착"},{"location":"512,1058,63,27","text":"6.00"},{"location":"196,1061,159,45","text":"납 품 용 적 1"},{"location":"676,1063,153,26","text":"ma 누 그"},{"location":"381,1113,288,24","text":"콘크리트의 굵은골재의 최대"},{"location":"705,1129,103,23","text":"르호칭강도"},{"location":"365,1143,307,23","text":"종류에 따른 구분 치수에 따른 구분"},{"location":"194,1156,131,26","text":"호 칭 방 법"},{"location":"365,1190,144,22","text":"보통콘크리트"},{"location":"582,1192,256,26","text":"25 18그*"},{"location":"598,1250,220,31","text":"시방 배합표(kg/n*)"},{"location":"980,871,90,28","text":"이은우"},{"location":"1054,1060,64,28","text":"6.00"},{"location":"1201,1065,23,25","text":"ma"},{"location":"1054,1114,139,24","text":"시멘트 종류에"},{"location":"870,1115,118,23","text":"습럼프 포는"},{"location":"870,1144,124,23","text":"슬럼프 들로`"},{"location":"1080,1146,94,22","text":"따른구분"},{"location":"1019,1179,212,24","text":"포를랜드시멘트 1종"},{"location":"902,1192,101,26","text":"150결 mm"},{"location":"176,1298,1064,34","text":"시멘트 시멘트 물 회수수 !잔골재 잔골재 자골재 은골저 은골재굵은골재 혼화재 혼화재 혼화재 혼화제fe화제 혼화제"},{"location":"465,1332,754,20","text":"0 :기-r, "},{"location":"342,1402,28,18","text":"172"},{"location":"184,1483,151,27","text":"물결합재비"},{"location":"471,1395,106,26","text":"467 46%"},{"location":"505,1484,58,25","text":"59.6"},{"location":"676,1403,19,17","text":"91"},{"location":"675,1484,189,27","text":"% 넣잔 골짜 율"},{"location":"888,1403,89,18","text":"43 43"},{"location":"1070,1398,42,23","text":"2.09"},{"location":"1010,1484,56,25","text":"512"},{"location":"366,1527,553,23","text":"고로슬해그미분낄 3종: 15% 풀라이OH시 2종: 15롷"},{"location":"183,1547,156,27","text":"지 정 사 항"},{"location":"313,1610,343,29","text":"고 염회물량: 0.3kg/m3 이하"},{"location":"913,1531,227,71","text":"7뇨조-"},{"location":"841,1606,194,32","text":"공기량: 4.5"},{"location":"1091,1614,77,24","text":" 1.5%"},{"location":"727,1659,136,27","text":"출하계 확인"},{"location":"983,1673,82,26","text":"인성훈"},{"location":"186,1675,146,25","text":"인수자 확인"},{"location":"721,1690,148,25","text":"표시사항확인"},{"location":"315,1731,730,31","text":"타 섬유보강제)상일동역사거리 직진 3-7게이트 329동"},{"location":"169,1841,185,21","text":"B5(182mm )(257m m)"},{"location":"550,1809,307,49","text":"우프Ip 주식회사 산하"}]'

inputArr = json.loads(input.replace(u"\u2022", u""))

inputArr = sortArrLocation(inputArr)

# {'location': '1263,187,58,38', 'text': '그 .'}
# 중심값 만들기
# (1263 + 58)/2  -> x좌표  (187 + 38)/2 -> y좌표 text 안에 공백 제거
# 문서번호 1 추가 
# 수정 후 {1, 660, 112, '그.'}
# print로 출력 1 660 112 그.,/n

print(str(inputArr))