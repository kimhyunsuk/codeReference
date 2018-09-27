from difflib import SequenceMatcher

def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()


print(similar("reinsurers outstanding losses,page,2018-11-13","reinsurers outstanding losses,page,2016-10-13"))