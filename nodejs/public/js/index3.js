$(document).on('ready', function(){

    $('#uploadFile').on('change', function(){

        $('#uploadFileForm').submit();
    })

    $('#uploadFileForm').ajaxForm({
        beforeSubmit: function (data, frm, opt) {
            fn_initUpload();
        },
        success: function (data) {
            console.log(data.ocrResult);
            var ocrResultList = data.ocrResult;

            var canvas = document.createElement('canvas');
            canvas.id = "myCanvas";
            
            canvas.width = 2481 * 0.4;
            canvas.height = 3508 * 0.4;
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = "#FFFFCC";  // 색상변경
            // ctx.font = "10px Georgia";
            $('#canversDiv').append(canvas);

            for(var i = 0; i < ocrResultList.length; i++){
                var ocrResult = ocrResultList[i];
                var location = ocrResult.location.split(',');

                if (i % 2 == 0) {
                    ctx.fillStyle = "#CCFFCC";  // 홀수번째 색상
                } else {
                    ctx.fillStyle = "#CCCCFF";  // 짝수번째 색상
                }

                ctx.fillRect((location[0] * 0.5), (location[1] * 0.5), (location[2] * 0.5), (location[3] * 0.5));
                // ctx.fillRect(location[0], location[1], location[2], location[3]);

                // ctx.font = location[3] * 0.4 + 'px sans-serif';
                ctx.strokeText(ocrResult.text, (location[0] * 0.5), (location[1] * 0.5 + 10));
                // ctx.strokeText(ocrResult.text, location[0], (location[1] * 1 + 10));
            }

            $('#uploadFile').val('');

            $('#ocrLocationEduDiv').show();

            var img = canvas.toDataURL('image/png');
            $('canvas').remove();
            var appendImgHtml = '<img src="' + img + '">';
            $('#canversDiv').append(appendImgHtml);
            
            $('img').selectAreas({

            });
        },
        error: function (e) {
        }
    });

    $('#label').change(function(){
        //var color = $(this).val();
        //$('.select-areas-outline').css('background', color);   
    })

    $('#btnImgPreview').click(function () {
        var areas = $('img').selectAreas('areas');
        var x = areas[0].x * 2.5;
        var y = areas[0].y * 2.5;
        var width = areas[0].width * 2.5;
        var height = areas[0].height * 2.5;
        var img = $('img').attr('src');
        $('#preview').css('background-image', 'url(\'/img/Certificate1.png\')')
        $('#preview').css('width', width);
        $('#preview').css('height', height);
        $('#preview').css('background-position', '-' + x + 'px -' + y + 'px');

    });

    $('#btnView').click(function () {
        var areas = $('img').selectAreas('areas');
        displayAreas(areas);
    });
    $('#btnViewRel').click(function () {
        var areas = $('img').selectAreas('relativeAreas');
        displayAreas(areas);
    });
    $('#btnReset').click(function () {
        output("reset")
        $('img').selectAreas('reset');
    });
    $('#btnDestroy').click(function () {
        $('img').selectAreas('destroy');

        output("destroyed")
        $('.actionOn').attr("disabled", "disabled");
        $('.actionOff').removeAttr("disabled")
    });
    $('#btnCreate').attr("disabled", "disabled").click(function () {
        $('img').selectAreas({
            minSize: [10, 10],
            onChanged : debugQtyAreas,
            width: 500,
        });

        output("created")
        $('.actionOff').attr("disabled", "disabled");
        $('.actionOn').removeAttr("disabled")
    });
    $('#btnNew').click(function () {
        var areaOptions = {
            x: Math.floor((Math.random() * 200)),
            y: Math.floor((Math.random() * 200)),
            width: Math.floor((Math.random() * 100)) + 50,
            height: Math.floor((Math.random() * 100)) + 20,
        };
        output("Add a new area: " + areaToString(areaOptions))
        $('img').selectAreas('add', areaOptions);
    });
    $('#btnNews').click(function () {
        var areaOption1 = {
            x: Math.floor((Math.random() * 200)),
            y: Math.floor((Math.random() * 200)),
            width: Math.floor((Math.random() * 100)) + 50,
            height: Math.floor((Math.random() * 100)) + 20,
        }, areaOption2 = {
            x: areaOption1.x + areaOption1.width + 10,
            y: areaOption1.y + areaOption1.height - 20,
            width: 50,
            height: 20,
        };
        output("Add a new area: " + areaToString(areaOption1) + " and " + areaToString(areaOption2))
        $('img').selectAreas('add', [areaOption1, areaOption2]);
    });
});

var selectionExists;

function areaToString (area) {
    //return (typeof area.id === "undefined" ? "" : (area.id + ": ")) + area.x + ':' + area.y  + ' ' + area.width + 'x' + area.height + '<br />'
    var color = '<div style="background:' + area.color + '; width:10px; height:10px; display:inline-block"></div>';
    return (typeof area.id === "undefined" ? "" : color + (area.label + ": ")) + area.x + ':' + area.y  + ' ' + area.width + 'x' + area.height + '<br />'
}

function output (text) {
    $('#output').html(text);
}

// Log the quantity of selections
function debugQtyAreas (event, id, areas) {
    console.log(areas.length + " areas", arguments);
};

// Display areas coordinates in a div
function displayAreas (areas) {
    var text = "";
    $.each(areas, function (id, area) {
        text += areaToString(area);
    });
    output(text);
};



function fn_initUpload() {
    // $('#ocrLocationEduDiv').hide();
    // $('input').val('');
    $('#canversDiv').empty();
}