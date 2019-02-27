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
            fn_initUpload();
            return true;
        },
        success: function (data) {
            console.log(data.ocrResult);
            var ocrResultList = data.ocrResult;

            var canvas = document.createElement('canvas');
            canvas.id = "myCanvas";
            
            canvas.width = 2481 * 0.4;
            canvas.height = 3508 * 0.4;
            var ctx = canvas.getContext("2d");
            $('#canversDiv').append(canvas);

            for(var i = 0; i < ocrResultList.length; i++){
                var ocrResult = ocrResultList[i];
                var location = ocrResult.location.split(',');

                ctx.strokeText(ocrResult.text, (location[0] * 0.4), (location[1] * 0.4));
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


