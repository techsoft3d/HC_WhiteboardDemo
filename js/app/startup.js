/*jshint esversion: 6 */

var hwv = null;
var ui = null;
var md = new MobileDetect(window.navigator.userAgent);


function renderPage(pdfDoc, num) {
    var lst = new Promise(function (resolve, reject) {
        pageRendering = true;
        // Using promise to fetch the page
        pdfDoc.getPage(num).then(function (page) {
            var canvas = $("#pdfcanvas")[0];
            var ctx = canvas.getContext('2d');
            var viewport = page.getViewport({ scale: 2 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            var renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            var renderTask = page.render(renderContext);

            // Wait for rendering to finish
            renderTask.promise.then(function () {
                var durl = canvas.toDataURL();
                var img = new Image();
                img.src = durl;
                wbManager.addFromImageConsecutive(img);

            });
        });
    });
    return lst;

}

function previewFile(file) {

   
    

    let reader = new FileReader()

    var myFormData = new FormData();
    myFormData.append('startpath',"Moto/_MOTO_X.asm");
    myFormData.append('image', file);

    
    $.ajax({
      url: 'http://Conversionservice5-env.eba-q6tssm3p.us-west-2.elasticbeanstalk.com/api/fileUpload',
      type: 'POST',
      processData: false, // important
      contentType: false, // important
      dataType : 'json',
      data: myFormData,
      success : function(result) {
            var i=0;
    }});

    if (file.type == "application/pdf") {
     


        reader.onload = function () {

            var typedarray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedarray).promise.then(function (pdfDoc_) {
                var proms = [];
                for (var i=0;i<pdfDoc_._pdfInfo.numPages;i++)
                    proms.push(renderPage(pdfDoc_, i));
                Promise.All(proms);
//                console.log(pdfDoc_.numPages);
                // do stuff
            });
        };
        reader.readAsArrayBuffer(file);


    }
    else {
        reader.readAsDataURL(file)
        reader.onloadend = function () {
            let img = document.createElement('img')
            img.src = reader.result;
            wbManager.addFromImage(img);
            //        document.getElementById('content').appendChild(img)
        }
    }
}


function handleDrop(ev) {
    event.preventDefault()
    var i = 0;
    let dt = ev.dataTransfer
    let files = dt.files;
    for (var i = 0; i < files.length; i++) {
        previewFile(files[i]);
    }

}


function handleDragEnter(ev) {
    event.preventDefault()
    var i = 0;

}

function handleDragLeave(ev) {
    event.preventDefault()
    var i = 0;

}
function handleDragOver(ev) {
    ev.preventDefault();

}

var exampleEditor

var ctrlPressed = false;
var shiftPressed = false;
function startup()
{
    $.notify.defaults({ className: "info" });
  

    $.notify("Whiteboard Demo\nBuild with HOOPS Communicator\n\nGeneral Tips:\nDouble Click to Activate and Interact with 3D Models.\nCtrl-Click to Highlight Multiple Items.\nMouse Wheel to Zoom.\nImages/PDF's can be dragged on Canvas.\n\n(Click on this Dialog to hide.)", {  clickToHide: true,autoHide: false, position:"top right" });

    var elem = document.querySelector('#carotadiv');
    exampleEditor = carota.editor.create(elem);

    // Whenever the document changes, re-display the JSON format and update undo buttons
    exampleEditor.contentChanged(function () {
        wbItemTextEditor.contentChanged();
    });


    $(document).on("keydown", (event) => {

    if (event.ctrlKey) {
            ctrlPressed = true;
        }
        else {
        ctrlPressed = false;
        }

        if (event.shiftKey) {
            shiftPressed = true;
        }
        else {
            shiftPressed = false;
        }
    });

    $(document).on("keyup", (event) => {

        var keycode = event.keyCode;

        if (event.ctrlKey) {
            ctrlPressed = true;
        }
        else {
            ctrlPressed = false;
        }


        if (event.shiftKey) {
            shiftPressed = true;
        }
        else {
            shiftPressed = false;
        }

        if (keycode == 67 && event.ctrlKey) //ctrl-c
        {
            wbManager.copy();
        }

        if (keycode == 86 && event.ctrlKey) //ctrl-v
        {
            wbManager.paste();
        }

    });



    $(document).on("mousedown", (event) => {
        blockRightClick = false;



    });


    $(document).on("mousemove", (event) => {
        blockRightClick = true;
    });


    wbManager.initialize("whiteboardcanvas", "whiteboardcanvasoverlay");
    hcModelCache.initialize("hcModelCache")
    menuManager.initialize();
   
    let dropArea = document.getElementById('content')

    dropArea.addEventListener('dragenter', handleDragEnter, false)
    dropArea.addEventListener('dragleave', handleDragLeave, false)
    dropArea.addEventListener('dragover', handleDragOver, false)
    dropArea.addEventListener('drop', handleDrop, false)

    

    var menu2 = [                  
        {
            name: 'Order & Locking',
            subMenu: [
                {
                    name: 'Bring To Front',
                    fun: function () {
                        wbManager.bringToFront();
                    }
                },
                {
                    name: 'Send To Back',
                    fun: function () {
                        wbManager.sendToBack();
                    }
                },
                {
                    name: 'Lock',
                    fun: function () {
                        //                        wbManager.setLocked(true);

                        fetch('http://localhost:3001/api/scs/f861e21f-e2eb-4baa-aa9e-c0854a9157df')
                            .then(
                                function (response) {
                                    if (response.status !== 200) {
                                        console.log('Looks like there was a problem. Status Code: ' +
                                            response.status);
                                        return;
                                    }
                                    // Examine the text in the response
                                    response.json().then(function (data) {
                                        console.log(data);
                                    });
                                }
                            )
                            .catch(function (err) {
                                console.log('Fetch Error :-S', err);
                            });



                    }
                },
                {
                    name: 'Unlock',
                    fun: function () {
                       // wbManager.setLocked(false);
                       // return;

                        fetch('http://localhost:3001/api/reconvert/ec1b121d-944b-450f-ba87-50ae45f561d4', {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'startPath':"micro_engine/_micro engine.CATProduct"
                            },
                        }).then(
                            function (response) {
                                if (response.status !== 200) {
                                    console.log('Looks like there was a problem. Status Code: ' +
                                        response.status);
                                    return;
                                }
                                // Examine the text in the response
                                response.json().then(function (data) {
                                    console.log(data);
                                });
                            }
                        )
                        .catch(function (err) {
                            console.log('Fetch Error :-S', err);
                    });
                        return;

                        var whiteboardid = window.location.href.split("?")[1].split("=")[1];
                        fetch('http://localhost:3001/api/data/f861e21f-e2eb-4baa-aa9e-c0854a9157df')
                            .then(
                                function (response) {
                                    if (response.status !== 200) {
                                        console.log('Looks like there was a problem. Status Code: ' +
                                            response.status);
                                        return;
                                    }
                                    // Examine the text in the response
                                    response.json().then(function (data) {
                                        console.log(data);
                                    });
                                }
                            )
                            .catch(function (err) {
                                console.log('Fetch Error :-S', err);
                        });
                 
                    }
                },
            ]
        },
        {
            name: 'Group',
            fun: function () {
                wbManager.group();
            }
        },
        {
            name: 'Ungroup',
            fun: function () {
                wbManager.ungroup();
            }
        },
        {
            name: 'Fit Selection',
            fun: function () {
                wbManager.fitSelection(1.5);
            }
        },
        {
            name: 'Fit All',
            fun: function () {
                wbManager.fitAll();
            }
        },       
        {
            name: 'Delete Selected',
            fun: function () {
                wbManager.handleDelete();
            }
        },        
        {
            name: 'Refresh Selected',
            fun: function () {
                wbManager.refreshAll();
            }
        },        
    ];

    $('#content').contextMenu("menu", menu2, {
        'triggerOn': 'click',
        'subMenuTriggerOn': 'hover',
    });

    $('#newdialogwindow').contextMenu("menu", menu2, {
        'triggerOn': 'click',
        'subMenuTriggerOn': 'hover',

    });
    $('#draggabletitle').contextMenu("menu", menu2, {
        'triggerOn': 'click',
        'subMenuTriggerOn': 'hover',
    });
    
}
