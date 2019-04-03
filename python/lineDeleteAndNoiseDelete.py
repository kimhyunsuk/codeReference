"""
@file morph_lines_detection hskim
"""
import numpy as np
import sys
import cv2 as cv

#지워야할 수평 선의 두께
deleteHorizontalLineWeight = 3
#지워야할 수직 선의 두께
deleteVerticalLineWeight = 3

def main(argv):
    # [load_image]
    if len(argv) < 1:
        print ('Not enough parameters')
        print ('Usage:\nmorph_lines_detection.py < path_to_image >')
        return -1
    # Load the image
    src = cv.imread(argv[0], cv.IMREAD_COLOR)
    # Check if image is loaded fine
    if src is None:
        print ('Error opening image: ' + argv[0])
        return -1

    #컬러 이미지 흑백 처리
    if len(src.shape) != 2:
        gray = cv.cvtColor(src, cv.COLOR_BGR2GRAY)
    else:
        gray = src

    #흑백 이미지 이진화 처리
    gray = cv.bitwise_not(gray)
    bw = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 15, -2)

    horizontal = np.copy(bw)
    vertical = np.copy(bw)

    cols = horizontal.shape[1]
    horizontal_size = cols / 20

    horizontalStructure = cv.getStructuringElement(cv.MORPH_RECT, (int(horizontal_size), 1))
    horizontalDilateStructure = cv.getStructuringElement(cv.MORPH_RECT, (int(horizontal_size), deleteHorizontalLineWeight))

    horizontal2 = cv.erode(horizontal, horizontalStructure)
    horizontal2 = cv.dilate(horizontal2, horizontalDilateStructure)

    horizontal = cv.bitwise_not(horizontal)
    horizontal = cv.add(horizontal, horizontal2)

    rows = vertical.shape[0]
    verticalsize = rows / 50

    verticalStructure = cv.getStructuringElement(cv.MORPH_RECT, (1, int(verticalsize)))
    verticalDilateStructure = cv.getStructuringElement(cv.MORPH_RECT, (deleteVerticalLineWeight, int(horizontal_size)))

    vertical = cv.erode(vertical, verticalStructure)
    vertical = cv.dilate(vertical, verticalDilateStructure)

    horizontal = cv.add(horizontal, vertical)


    #otsu 알고리즘 노이즈 제거 처리
    img_blur = cv.GaussianBlur(horizontal, (5, 5), 0)
    ret, horizontal = cv.threshold(img_blur, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
    #fastNI 알고리즘 노이즈 제거 처리 otsu 가 성능이 안나올경우 사용
    # horizontal = cv.fastNlMeansDenoising(horizontal, None, 13, 13)
    horizontal = cv.resize(horizontal, dsize=(1420, 2048), interpolation=cv.INTER_AREA)
    cv.imwrite("C:/ICR/uploads/Gray_Image2.jpg", horizontal)

    return 0
if __name__ == "__main__":
    main(sys.argv[1:])