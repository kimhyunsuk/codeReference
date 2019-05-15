import cv2
import numpy as np
from scipy.ndimage import interpolation as inter
from PIL import Image as im
import matplotlib
import os
import uuid
import math
import linedel as lineDel
from pdf2image import convert_from_path, convert_from_bytes
from google.cloud import vision
import io
#지워야할 수평 선의 두께
deleteHorizontalLineWeight = 2
#지워야할 수직 선의 두께
deleteVerticalLineWeight = 2

def main():
    filefolder = 'C:/ICR/uploads/'
    file_list = os.listdir(filefolder)

    ocrReq(filefolder,file_list)
    for singlefile in file_list:
        if os.path.splitext(singlefile)[1] == ".pdf":
            fileNames = convertPdfToImage(filefolder, singlefile)

            rtnImg = angle_rotation(filefolder + fileNames[0])
            #cv2.imshow("Cropped and thresholded image", rtnImg)
            #cv2.waitKey(0)
            rtnImg = get_croped(rtnImg)
            #cv2.imshow("Cropped and thresholded image", rtnImg)
            #cv2.waitKey(0)
            rtnImg = imgResize(rtnImg)
            #cv2.imshow("Cropped and thresholded image", rtnImg)
            #cv2.waitKey(0)



            cv2.imwrite(filefolder + fileNames[0], rtnImg)


def ocrReq(filefolder,file_list):
    for singlefile in file_list:
        if os.path.splitext(singlefile)[1] == ".jpg":
            #orgimage = cv2.imread(filefolder + singlefile)
            with io.open(filefolder + singlefile, 'rb') as image_file:
                content = image_file.read()

            client = vision.ImageAnnotatorClient()

            image = vision.types.Image(content=content)

            response = client.document_text_detection(image=image)

            ocrData = googleOcrParsing(response)
            print(str(ocrData).replace("'", '"'))

    return response


def googleOcrParsing(response):
    ocrData = []
    for page in response.full_text_annotation.pages:
        for block in page.blocks:
            # print('\nBlock confidence: {}\n'.format(block.confidence))

            for paragraph in block.paragraphs:
                # print('Paragraph confidence: {}'.format(paragraph.confidence))

                for word in paragraph.words:
                    word_text = ''.join([
                        symbol.text for symbol in word.symbols
                    ])

                    x = word.bounding_box.vertices[0].x
                    y = word.bounding_box.vertices[0].y

                    width = int(word.bounding_box.vertices[1].x) - int(word.bounding_box.vertices[0].x)
                    height = int(word.bounding_box.vertices[3].y) - int(word.bounding_box.vertices[0].y)

                    location = str(x) + ',' + str(y) + ',' + str(width) + ',' + str(height)
                    ocrData.append({"location": location, "text": word_text})
                    #print(location + '\t'+ word_text)


    #y축 다음 x축 기준으로 소팅

    #text에 관한 전처리
    ocrPreProcessData = []

    for idx in range(len(ocrData)):
        # text가 "|" 일 경우 text를 삭제한다
        if ocrData[idx]['text'] == '|':
            print(ocrData[idx]['text'])

        # 같은 라인에 거리가 가까운 text는 합친다
        if distanceParams(ocrData[idx], mostCloseWordSameLine(ocrData[idx], extractSameLine(ocrData[idx], ocrData))) < 10:
            ocrPreProcessData.append(ocrData[idx] + ocrData[idx + 1])
        # 같은 줄에 다음 text와 합쳐서 레이블의 부분일 경우 합친다

        # 같은 줄에 다음 text가 숫자 다음 '시' 숫자 '분'  경우 합친다.


    return ocrPreProcessData

#temparr에서 tempdict와 같은 라인에 있는 원소를 찾는다
def extractSameLine(tempdict, temparr):
    dictArr = []

    return dictArr
#temparr에서 tempdict와 가장 가까운 원소를 찾는다
def mostCloseWordSameLine(tempdict, temparr):
    retDict = {}

    return retDict

#tempdict와 comparedict의 거리를 구한다
def distanceParams(tempdict, comparedict):
    retInt = 0

    return retInt

def angle_rotation(filename):
    # 기울기 보정
    image = cv2.imread(filename)

    img = im.open(filename)
    # img2 = img
    wd, ht = img.size
    pix = np.array(img.convert('1').getdata(), np.uint8)
    bin_img = 1 - (pix.reshape((ht, wd)) / 255.0)
    #plt.imshow(bin_img, cmap='gray')
    # plt.savefig(filename)

    delta = 0.5
    limit = 5
    angles = np.arange(-limit, limit + delta, delta)
    scores = []
    for angle in angles:
        hist, score = find_score(bin_img, angle)
        scores.append(score)

    best_score = max(scores)
    best_angle = angles[scores.index(best_score)]
    print('Best angle: {}'.format(best_angle))

    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    if(best_angle == 1):
        best_angle = best_angle * 0.6
    elif(best_angle == 2):
        best_angle = 2.9

    M = cv2.getRotationMatrix2D(center, best_angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h),
                             flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return rotated

def get_croped(rotated):
    #이미지 여백 크롭
    #rsz_img = cv2.resize(rotated, None, fx=0.25, fy=0.25)  # resize since image is huge

    gray = cv2.cvtColor(rotated, cv2.COLOR_BGR2GRAY)  # convert to grayscale

    # gray = cv2.GaussianBlur(gray, (5, 5), 0)
    # cv2.imshow("Cropped and thresholded image", gray)
    # cv2.waitKey(0)
    ret, gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    #cv2.imshow("Cropped and thresholded image", cv2.resize(gray, None, fx=0.15, fy=0.15))
    #cv2.waitKey(0)


    #retval, thresh_crop = cv2.threshold(horizontal, thresh=200, maxval=255, type=cv2.THRESH_BINARY)
    #cv2.imshow("Cropped and thresholded image", thresh_crop)
    #cv2.waitKey(0)

    # 원본 이미지 사이즈 추출
    x, y, w, h = cv2.boundingRect(gray)  # create a rectangle around those points
    x, y, w, h = x + 30, y + 30, w - 30, h - 40  # make the box a little bigger
    # 상하좌우 일정 부분 크롭
    gray = gray[y:y + h, x:x + w]  # create a cropped region of the gray image
    #x, y, w, h = x + 120, y + 120, w - 120, h - 160 # make the a little bigger
    rotated = rotated[y:y + h, x:x + w]  # create a cropped region of the gray image

    #cv2.imshow("Cropped and thresholded image", gray)
    #cv2.waitKey(0)
    # threshold to get just the signature
    # 70 진한 검은색 60 더 검은색
    retval, thresh_gray = cv2.threshold(gray, thresh=110, maxval=255, type=cv2.THRESH_BINARY)
    thresh_gray = cv2.GaussianBlur(thresh_gray, (7, 7), 0)
    #cv2.imshow("Cropped and thresholded image", cv2.resize(thresh_gray, None, fx=0.15, fy=0.15))
    #cv2.waitKey(0)
    # find where the signature is and make a cropped region
    points = np.argwhere(thresh_gray == 0)  # find where the black pixels are
    points = np.fliplr(points)  # store them in x,y coordinates instead of row,col indices
    x, y, w, h = cv2.boundingRect(points)  # create a rectangle around those points
    #x, y, w, h = x-10, y-10, w+20, h+20 # make the box a little bigger
    # 상하좌우 여백 크롭
    crop = rotated[y:y + h, x:x + w]  # create a cropped region of the gray image
    #cv2.imshow("Cropped and thresholded image", cv2.resize(crop, None, fx=0.15, fy=0.15))
    #cv2.waitKey(0)
    #cv2.imshow("Cropped and thresholded image", crop)
    #cv2.waitKey(0)
    #retval, thresh_crop = cv2.threshold(crop, thresh=200, maxval=255, type=cv2.THRESH_BINARY)

    #thresh_crop = lineDel.main(thresh_crop)
    return crop

# pdf 에서 png 변환 함수
def convertPdfToImage(upload_path, pdf_file):

    try:
        pages = convert_from_path(upload_path + pdf_file, dpi=500, output_folder=None, first_page=None,
                                  last_page=None,
                                  fmt='ppm', thread_count=1, userpw=None, use_cropbox=False, strict=False,
                                  transparent=False)
        pdf_file = pdf_file[:-4]  # 업로드 파일명
        filenames = []
        for page in pages:
            filename = "%s-%d.jpg" % (pdf_file, pages.index(page))
            page.save(upload_path + filename, "JPEG", dpi=(500, 500))
            filenames.append(filename)
        return filenames
    except Exception as e:
        print(e)

def imgResize(img):
    try:
        # FIX_LONG = 3600
        # FIX_SHORT = 2400

        FIX_LONG = 2970
        FIX_SHORT = 2100
        index = 0
        height, width = img.shape[0:2]
        imagetype = "hori"
        # 배율
        magnify = 1
        if width - height > 0:
            imagetype = "hori"
            if (width / height) > (FIX_LONG / FIX_SHORT):
                magnify = round((FIX_LONG / width) - 0.005, 2)
            else:
                magnify = round((FIX_SHORT / height) - 0.005, 2)
        else:
            imagetype = "vert"
            if (height / width) > (FIX_LONG / FIX_SHORT):
                magnify = round((FIX_LONG / height) - 0.005, 2)
            else:
                magnify = round((FIX_SHORT / width) - 0.005, 2)

        # 확대, 축소
        img = cv2.resize(img, dsize=(0, 0), fx=magnify, fy=magnify, interpolation=cv2.INTER_LINEAR)
        height, width = img.shape[:2]
        # 여백 생성
        if imagetype == "hori":
            img = cv2.copyMakeBorder(img, 0, FIX_SHORT - height, 0, FIX_LONG - width, cv2.BORDER_CONSTANT,
                                     value=[255, 255, 255])
        else:
            img = cv2.copyMakeBorder(img, 0, FIX_LONG - height, 0, FIX_SHORT - width, cv2.BORDER_CONSTANT,
                                     value=[255, 255, 255])
        return img
    except Exception as ex:
        raise Exception(
            str({'code': 500, 'message': 'imgResize error', 'error': str(ex).replace("'", "").replace('"', '')}))

def find_score(arr, angle):
    data = inter.rotate(arr, angle, reshape=False, order=0)
    hist = np.sum(data, axis=1)
    score = np.sum((hist[1:] - hist[:-1]) ** 2)
    return hist, score


if __name__ == "__main__":
    main()