update tbl_batch_learn_data A set A.IMGID = (select IMGID from TBL_BATCH_ANSWER_FILE B where B.FILEPATH = CONCAT(A.FILEPATH, A.FILENAME) AND ROWNUM = 1);