"use strict";


$(document).on('ready', function(){

    $('#uploadFile').on('change', function(){

        $('#uploadFileForm').submit();
    })

    $('#uploadFileForm').ajaxForm({
        
        beforeSubmit: function (data, frm, opt) {
            fn_initUpload();
        },
        success: function (data) {
            $('#uploadFile').val('');
            var appendImgHtml = '<img src="/img/' + data.filename + '" id="photo" style="width:992; height:1403">';
            $('#canversDiv').append(appendImgHtml);
            $('#ocrLocationEduDiv').show();
            $('img#photo').on('load', function(){
                $('img#photo').imgAreaSelect({
                    handles: true,
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

    
})

$(document).on('mouseover', '.location', function(){
    if($(this).val() != '') {
        var location = $(this).val().split(',');
        var ias = $('#photo').imgAreaSelect({ instance: true });
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
        var ias = $('#photo').imgAreaSelect({ remove: true });
    }
    
    $('input').val('');
    $('#canversDiv').empty();
}

