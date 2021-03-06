import numpy as np
import os
import sys
import re
import json
import DBase

class DomainDicTrans():
    def lookup(self, phrase):
        originword = ''
        frontword = ''
        rearword = ''
        returnsentence = ''
        dbConnection = DBase.Oracle()
        sql = "SELECT CORRECTEDWORDS FROM TBL_OCR_DOMAIN_DIC_TRANS WHERE ORIGINWORD = :orign AND FRONTWORD = :front  AND REARWORD = :rear"
        for i in range(len(phrase)):
            if i == 0:
                frontword = '<<N>>'
            else:
                frontword = phrase[i-1]
            if i == len(phrase) - 1:
                rearword = '<<N>>'
            else:
                rearword = phrase[i+1]
            originword = phrase[i]

            params = [originword, frontword, rearword]
            #print(dbConnection.selectDDT(sql, params).get('CORRECTEDWORDS'))

            if (returnsentence != ''):
                returnsentence = returnsentence + ' '
            corretedwords = dbConnection.selectDDT(sql, params)
            if (len(corretedwords) > 0):
                if (corretedwords == '<<N>>'):
                    returnsentence = returnsentence[0:-1]
                else:
                    returnsentence = returnsentence + corretedwords
            else:
                returnsentence = returnsentence + originword

        return returnsentence
