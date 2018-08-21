from symspell import SymSpell
import sys
import cx_Oracle
import configparser
import json
#오타 수정
ss = SymSpell(max_dictionary_edit_distance=2)
ss.load_words_with_freq_from_json_and_build_dictionary()

textList = []

id = 'koreanre'
pw = 'koreanre01'
sid = 'koreanreocr'
ip = '172.16.53.142'
port = '1521'

connInfo = id + "/" + pw + "@" + ip + ":" + port + "/" + sid

conn = cx_Oracle.connect(connInfo)
curs = conn.cursor()

sql = "SELECT SEQNUM FROM TBL_OCR_SYMSPELL WHERE KEYWORD = :bind"

inputArr = json.loads(sys.argv[1])

for ocrItem in inputArr:
    tempSentence = ''
    for word in ocrItem['text'].split():
        word = word.encode("euc_kr", "replace")
        word = word.decode("euc_kr")

        curs.execute(sql,bind = word.lower())
        result = curs.fetchall()

        if (len(result) > 0):
            tempSentence = tempSentence + ' ' + word
        else:
            suggestion_list = ss.lookup(phrase=word.lower(), verbosity=1, max_edit_distance=2)

            #exist ml suggestion
            if (len(suggestion_list) > 0):
                tempSentence = tempSentence + ' ' + suggestion_list[0].term
            #no exist ml suggestion
            else:
                tempSentence = tempSentence + ' ' + word
    ocrItem['originText'] = ocrItem['text']
    ocrItem['text'] = tempSentence.strip()

print(str(inputArr))
