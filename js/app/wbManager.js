var blockRightClick = false;
var cmOpen = false;
var blockActivate = false;

var lastX, lastY;


function wbManager_() {
    var nextgroupid = 1;
    var canvas; 
    var ctx;
    var scaleFactor = 1.1;
    var whiteboardItems = [];
    var ctx_o;
    var rectangleLoadData;
    var operator;
    var copyItems = [];
    var zoomdistance;
    var zoomcenter;
    var consecutiveY;
    var dirty = false;

    function array_move(arr, old_index, new_index) {
        if (new_index >= arr.length) {
            var k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; // for testing
    };



    // Adds ctx.getTransform() - returns an SVGMatrix
    // Adds ctx.transformedPoint(x,y) - returns an SVGPoint
    function trackTransforms(ctx) {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        var xform = svg.createSVGMatrix();
        ctx.getTransform = function () { return xform; };

        var savedTransforms = [];
        var save = ctx.save;
        ctx.save = function () {
            savedTransforms.push(xform.translate(0, 0));
            return save.call(ctx);
        };
        var restore = ctx.restore;
        ctx.restore = function () {
            xform = savedTransforms.pop();
            return restore.call(ctx);
        };

        var scale = ctx.scale;
        ctx.scale = function (sx, sy) {
            xform = xform.scaleNonUniform(sx, sy);
            return scale.call(ctx, sx, sy);
        };
        var rotate = ctx.rotate;
        ctx.rotate = function (radians) {
            xform = xform.rotate(radians * 180 / Math.PI);
            return rotate.call(ctx, radians);
        };
        var translate = ctx.translate;
        ctx.translate = function (dx, dy) {
            xform = xform.translate(dx, dy);
            return translate.call(ctx, dx, dy);
        };
        var transform = ctx.transform;
        ctx.transform = function (a, b, c, d, e, f) {
            var m2 = svg.createSVGMatrix();
            m2.a = a; m2.b = b; m2.c = c; m2.d = d; m2.e = e; m2.f = f;
            xform = xform.multiply(m2);
            return transform.call(ctx, a, b, c, d, e, f);
        };
        var setTransform = ctx.setTransform;
        ctx.setTransform = function (a, b, c, d, e, f) {
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(ctx, a, b, c, d, e, f);
        };
        var pt = svg.createSVGPoint();
        ctx.transformedPoint = function (x, y) {
            pt.x = x; pt.y = y;
            return pt.matrixTransform(xform.inverse());
        }

        ctx.transformedPoint2 = function (x, y) {
            pt.x = x; pt.y = y;
            return pt.matrixTransform(xform);
        }


    }

    
    return {
        initialize: function (canvasid, canvasoverlayid) {
            canvas = $("#" + canvasid)[0];
            var overlaycanvas = $("#" + canvasoverlayid)[0];
            ctx = canvas.getContext('2d');
            ctx_o = overlaycanvas.getContext('2d');
            var d = $("#" + canvasid).parent();
            var boundingrect = d[0].getBoundingClientRect()
            $("#" + canvasid).attr("width", boundingrect.width)
            $("#" + canvasid).attr("height", boundingrect.height)

            $("#" + canvasoverlayid).attr("width", boundingrect.width)
            $("#" + canvasoverlayid).attr("height", boundingrect.height)

            lastX = canvas.width / 2;
            lastY = canvas.height / 2;
            _this = this;

            trackTransforms(ctx);
            wbManagerAlignment.initialize(ctx);
          
            operator = new wbOperator(ctx,ctx_o);
            $("#mainwindow").css("position", "fixed");
            $("#mainwindow").on("mousedown", (evt) => {
                operator.onMouseDown(evt.pageX, evt.pageY,evt.button);
            });
           
          

            $(window).resize(function() {
                var d = $(window);
                $("#" + canvasid).attr("width", d.width())
                $("#" + canvasid).attr("height", d.height())
    
                $("#" + canvasoverlayid).attr("width", d.width())
                $("#" + canvasoverlayid).attr("height", d.height())
                wbManager.redraw();
              });


            $("#mainwindow").on("touchstart", (evt) => {
                if (evt.touches.length > 1) {
                    zoomcenter = new Communicator.Point2((evt.touches[1].pageX + evt.touches[0].pageX) / 2, (evt.touches[1].pageY + evt.touches[0].pageY) / 2);
                    zoomdistance = new Communicator.Point2((evt.touches[1].pageX - evt.touches[0].pageX), (evt.touches[1].pageY - evt.touches[0].pageY)).length();
                    operator.onMouseDown(zoomcenter.x, zoomcenter.y, 2);
                }
                else
                    operator.onMouseDown(evt.touches[0].pageX, evt.touches[0].pageY, 0);

            });

            $("#mainwindow").on("mousemove", (evt) => {
                operator.onMouseMove(evt.pageX, evt.pageY, evt.button);
            });

            $("#mainwindow").on("touchmove", (evt) => {
                if (evt.scale !== 1) { evt.preventDefault(); }
                console.log(evt.scale);
                if (evt.touches.length > 1) {
                    operator.onMouseMove(evt.touches[0].pageX, evt.touches[0].pageY, 2);
                    var zoomcenter2 = new Communicator.Point2((evt.touches[1].pageX + evt.touches[0].pageX) / 2, (evt.touches[1].pageY + evt.touches[0].pageY) / 2);
                    operator.onMouseMove(zoomcenter2.x, zoomcenter2.y, 2);
//                    zoomcenter2 = ctx.transformedPoint(zoomcenter2.x, zoomcenter2.y);
                    var zoomdistance2 = new Communicator.Point2((evt.touches[1].pageX - evt.touches[0].pageX), (evt.touches[1].pageY - evt.touches[0].pageY)).length();

                    wbManager.zoomTouch(zoomcenter2.x, zoomcenter2.y, zoomdistance2 / zoomdistance);
                    zoomdistance = zoomdistance2;
                    zoomcenter = zoomcenter2;
                    wbManager.respositionNonCanvasItems();

                }
                else
                    operator.onMouseMove(evt.touches[0].pageX, evt.touches[0].pageY, 0);

            });

            $("#mainwindow").on("touchend", (evt) => {
                operator.onMouseUp(0,0, 0);
            });


            $("#mainwindow").on("mouseup", (evt) => {
                operator.onMouseUp(evt);
            });

            canvas.addEventListener('DOMMouseScroll', function (evt) {
                operator.onMouseWheel(evt)
            }, false);

            canvas.addEventListener('mousewheel', function (evt) {
                operator.onMouseWheel(evt)
            }, false);
          
            this.redraw();
        },
        convertWindowToCanvasCoordinates: function (dimensions) {
            var p1 = ctx.transformedPoint(dimensions.left, dimensions.top);
            var p2 = ctx.transformedPoint(dimensions.left + dimensions.width, dimensions.top + dimensions.height);
            return ({ left: p1.x, top: p1.y, width: p2.x - p1.x, height: p2.y - p1.y });
        },
        convertCanvasToWindowCoordinates: function (dimensions) {
            var p1 = ctx.transformedPoint2(dimensions.left, dimensions.top);
            var p2 = ctx.transformedPoint2(dimensions.left + dimensions.width, dimensions.top + dimensions.height);
            return ({ left: p1.x, top: p1.y, width: p2.x - p1.x, height: p2.y - p1.y });
        },

        clearSelection: function () {
            for (var i = 0; i < whiteboardItems.length; i++) {
                whiteboardItems[i].setSelected(false);
            }
        },     
        setSelected: function (itemid) {
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (itemid == i)
                    whiteboardItems[i].setSelected(true);
                else
                    whiteboardItems[i].setSelected(false);
            }
        },
        selectRelatedGroups: function() {
            var groupids = [];
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (whiteboardItems[i].getSelected() == true) {
                    var g = whiteboardItems[i].getGroup();
                    if (g != undefined)
                        groupids[g] = true;
                }
            }
            for (var i in groupids) {
                for (var j = 0; j < whiteboardItems.length; j++) {
                    if (whiteboardItems[j].getGroup() == i) {
                        whiteboardItems[j].setSelected(true);
                    }
                }

            }

        },
        getItemByIndex: function (index) {
            return whiteboardItems[index];
        },
        redraw: function () {

            var p1 = ctx.transformedPoint(0, 0);
            var p2 = ctx.transformedPoint(canvas.width, canvas.height);
            var rex = p1.x % 80; 
            var rey = p1.y % 80; 
            ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
            ctx_o.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
            ctx.fillStyle = "rgb(179,185,194)";
            if (ctx.getTransform().a > 0.155) {
                for (var x = p1.x - rex; x < p2.x; x += 80) {
                    for (var y = p1.y - rey; y < p2.y; y += 80) {
                        ctx.fillRect(x, y, 5, 5)
                    }
                }
            }

            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "rgb(255,255,255)";

            for (var i = 0; i < whiteboardItems.length; i++) 
                whiteboardItems[i].render(ctx, ctx_o);            
            if (rectangleLoadData != undefined) {
                var dragStart = operator.dragStart;
                var pt = ctx.transformedPoint(lastX, lastY);
                ctx_o.strokeStyle = "rgb(0,0,0)";
                ctx_o.fillStyle = "rgb(255,255,255)";
                ctx_o.lineWidth = 1 / ctx.getTransform().a;
                ctx_o.strokeRect(dragStart.x, dragStart.y, pt.x - dragStart.x, pt.y - dragStart.y);
                ctx_o.globalAlpha = 0.2;
                ctx_o.fillRect(dragStart.x, dragStart.y, pt.x - dragStart.x, pt.y - dragStart.y);
                ctx_o.globalAlpha = 1.0;
            }

            if (operator.drawSelectionRectangle) {
                var dragStart = operator.dragStart;
                var pt = ctx.transformedPoint(lastX, lastY);
                ctx_o.strokeStyle = "rgb(0,0,255)";
                ctx_o.fillStyle = "rgb(0,0,255)";
                ctx_o.lineWidth = 1 / ctx.getTransform().a;
                ctx_o.strokeRect(dragStart.x, dragStart.y, pt.x - dragStart.x, pt.y - dragStart.y);
                ctx_o.globalAlpha = 0.2;
                ctx_o.fillRect(dragStart.x, dragStart.y, pt.x - dragStart.x, pt.y - dragStart.y);
                ctx_o.globalAlpha = 1.0;
            }
            else {            
                    var boundinginfo = this.calculateSelectionBounding(false);
                    if (boundinginfo != undefined) {
                        var b = boundinginfo.bounding;
                        ctx_o.strokeStyle = "rgb(0,0,255)";
                        ctx_o.fillStyle = "rgb(255,255,255)";
                        ctx_o.lineWidth = 1 / ctx.getTransform().a;
                        ctx_o.strokeRect(b.x1, b.y1, b.x2 - b.x1, b.y2 - b.y1);
                        ctx_o.beginPath();
                        ctx_o.arc(b.x2, b.y2, 5 / ctx.getTransform().a, 0, 2 * Math.PI);
                        ctx_o.fill();
                        ctx_o.stroke();
                        ctx_o.beginPath();
                        ctx_o.arc(b.x1, b.y1, 5 / ctx.getTransform().a, 0, 2 * Math.PI);
                        ctx_o.fill();
                        ctx_o.stroke();
                        ctx_o.beginPath();
                        ctx_o.arc(b.x1, b.y2, 5 / ctx.getTransform().a, 0, 2 * Math.PI);
                        ctx_o.fill();
                        ctx_o.stroke();
                        ctx_o.beginPath();
                        ctx_o.arc(b.x2, b.y1, 5 / ctx.getTransform().a, 0, 2 * Math.PI);
                        ctx_o.fillStyle = "rgb(255,255,255)";
                        ctx_o.fill();
                        ctx_o.stroke();
                        ctx_o.fillRect((b.x2 + b.x1) / 2 - 5 / ctx.getTransform().a, b.y1 - 5 / ctx.getTransform().a, 10 / ctx.getTransform().a, 10 / ctx.getTransform().a)
                        ctx_o.strokeRect((b.x2 + b.x1) / 2 - 5 / ctx.getTransform().a, b.y1 - 5 / ctx.getTransform().a, 10 / ctx.getTransform().a, 10 / ctx.getTransform().a)


                    }                
            }

        },
        zoom: function (clicks) {
            var pt = ctx.transformedPoint(lastX, lastY);
            ctx.translate(pt.x, pt.y);
            var factor = Math.pow(scaleFactor, clicks);
            ctx.scale(factor, factor);
            ctx.translate(-pt.x, -pt.y);

            ctx_o.translate(pt.x, pt.y);
            ctx_o.scale(factor, factor);
            ctx_o.translate(-pt.x, -pt.y);

            carotaScale = ctx.getTransform().a;    
            this.redraw();
        },
        zoomTouch: function (x,y,scaleFactor) {
            var pt = ctx.transformedPoint(x, y);
            ctx.translate(pt.x, pt.y);
            ctx.scale(scaleFactor, scaleFactor);
            ctx.translate(-pt.x, -pt.y);

            ctx_o.translate(pt.x, pt.y);
            ctx_o.scale(scaleFactor, scaleFactor);
            ctx_o.translate(-pt.x, -pt.y);

            carotaScale = ctx.getTransform().a;
            this.redraw();
        },
        fitAll: function () {
            var b = this.calculateCombinedBounding(this.getItems());
            this.fitSelection(1.5, b);
        },
        fitSelection: function (duration,ub) {
            var b;
            if (ub == undefined)
                b = this.calculateSelectionBounding().bounding;
            else {
                if (ub.x1 != undefined)
                    b = ub;
                else
                    b = { x1: ub.left, y1: ub.top, x2: ub.left + ub.width, y2: ub.top + ub.height };
            }

            var d = $("#whiteboardcanvas");
            var cb = d[0].getBoundingClientRect()

            var t = ctx.getTransform();
            var sfwidth = cb.width / (b.x2 - b.x1);
            var sfheight = cb.height / (b.y2 - b.y1);
            var totalsf;
            if (sfwidth < sfheight)
                totalsf = sfwidth;
            else
                totalsf = sfheight;

            totalsf -= 0.1;

//            ctx.setTransform(totalsf, 0, 0, totalsf, -b.x1 * totalsf + cb.width / 2 - (b.x2 - b.x1) / 2 * totalsf, -b.y1 * totalsf + cb.height / 2 - (b.y2 - b.y1) / 2 * totalsf);
//            ctx_o.setTransform(totalsf, 0, 0, totalsf, -b.x1 * totalsf + cb.width / 2 - (b.x2 - b.x1) / 2 * totalsf, -b.y1 * totalsf + cb.height / 2 - (b.y2 - b.y1) / 2 * totalsf);
   //         this.redraw();
            //         wbManager.respositionNonCanvasItems();
            this.animateCanvasCamera(t.e, t.f, t.a, -b.x1 * totalsf + cb.width / 2 - (b.x2 - b.x1) / 2 * totalsf, -b.y1 * totalsf + cb.height / 2 - (b.y2 - b.y1) / 2 * totalsf, totalsf, duration);

        },
        animateCanvasCamera: function (x1, y1, s1, x2, y2, s2, duration) {
            var obj = { x: x1, y: y1, s: s1 };
            menuManager.hideSelectionMenu();
            gsap.to(obj, {
                duration: duration,
                x: x2,
                y: y2,
                s: s2,
                ease: Power2.easeInOut,
                //onUpdate fires each time the tween updates; we'll explain callbacks later.
                onUpdate: function () {
                    ctx.setTransform(obj.s, 0, 0, obj.s, obj.x, obj.y);
                    ctx_o.setTransform(obj.s, 0, 0, obj.s, obj.x, obj.y);
                    wbManager.redraw();
                    wbManager.respositionNonCanvasItems();
                },
                onComplete: function () {
                    menuManager.showSelectionMenu();
                }


            });

        },
        activateItemUnderMouse: function () {

            var item = this.findwbItemUnderMouse();
            item.activate(ctx);
            this.redraw();
        },
        deactivateAll: function (deactivateHC) {

            var _this = this;
            var lst = new Promise(function (resolve, reject) {
                var proms = [];
                for (var i = 0; i < whiteboardItems.length; i++) {
                    if (whiteboardItems[i].getActive() && (whiteboardItems[i].getType() != wbItemType.wbItemHC || deactivateHC == true))
                        proms.push(whiteboardItems[i].deactivate());
                }
                if (deactivateHC)
                    wbItemHC.activeHCItem = undefined;
                Promise.all(proms).then(function () {
                    setTimeout(function () {
                        _this.redraw();
                    }, 200);
                    resolve();
                });
            });
            return lst;
             
        },
        findwbItemIndexUnderMouse: function () {
            var pt = ctx.transformedPoint(lastX, lastY);
            for (var i = whiteboardItems.length - 1; i >= 0; i--) {
                if (whiteboardItems[i].pointInsideItem(pt))
                    return i;

            }
            return undefined;
        },
        findwbItemUnderMouse: function () {
            var pt = ctx.transformedPoint(lastX, lastY);
            for (var i = whiteboardItems.length - 1; i >= 0; i--) {
                if(whiteboardItems[i].pointInsideItem(pt))
                    return whiteboardItems[i];                

            }
            return undefined;
        },        
        findwbItemHCUnderMouse: function () {
            var item = this.findwbItemUnderMouse();
            if (item != undefined) {
                if (item.getType() == wbItemType.wbItemHC)
                    return item;
                else
                    return undefined;
            }
        },
        selectFromRectangle: function (dragStart) {
            var pt = ctx.transformedPoint(lastX, lastY);
            for (var i = 0; i < whiteboardItems.length; i++) {
                var d = whiteboardItems[i].getDimensions();
                if (!((d.left < dragStart.x && d.left + d.width < dragStart.x) ||
                    (d.left > pt.x && d.left + d.width > pt.x) ||
                    (d.top < dragStart.y && d.top + d.height < dragStart.y) ||
                    (d.top > pt.y && d.top + d.height > pt.y)))
                    whiteboardItems[i].setSelected(true);
                else
                    whiteboardItems[i].setSelected(false);
            }
            this.selectRelatedGroups();

        },
        getSelectedItems() {
            var selectedItems = []
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (whiteboardItems[i].getSelected()) {
                    selectedItems.push(whiteboardItems[i]);
                }
            }
            return selectedItems;
        },
        getLineItems() {
            var selectedItems = []
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (whiteboardItems[i].getType() == wbItemType.wbLine) {
                    selectedItems.push(whiteboardItems[i]);
                }
            }
            return selectedItems;
        },
        getCachedSelectedItems() {
            return operator.cachedSelectedItems;
        },       
        getCachedLineItems() {
            return operator.cachedLineItems;
        },     
        calculateSelectionBounding: function (temp) {
            var bounding = { x1: Number.MAX_VALUE, y1: Number.MAX_VALUE, x2: -Number.MAX_VALUE, y2: -Number.MAX_VALUE };
            var hasSelection = false;
            var hashcWindow = false;
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (whiteboardItems[i].getSelected()) {
                    hasSelection = true;
                    if (((whiteboardItems[i].getType() == wbItemType.wbItemHC || (whiteboardItems[i].getImage() != undefined && whiteboardItems[i].getDiv() == undefined)) && !whiteboardItems[i].getActive()) || (whiteboardItems[i].getShape() == wbItemShape.circle))
                        hashcWindow = true;
                    var t;
                    if (temp)
                        t = whiteboardItems[i].getTempDimensions();
                    else
                        t = whiteboardItems[i].getDimensions();

                    if (bounding.x1 > t.left)
                        bounding.x1 = t.left;
                    if (bounding.x2 < t.left + t.width)
                        bounding.x2 = t.left + t.width;
                    if (bounding.y1 > t.top)
                        bounding.y1 = t.top;
                    if (bounding.y2 < t.top + t.height)
                        bounding.y2 = t.top + t.height;
                }
            }
            if (hasSelection)
                return {
                    bounding: bounding, keepAspectRatio: hashcWindow
                };
            else
                return undefined;
        },         
        calculateCombinedBounding: function (whiteboardItems) {
            var bounding = { x1: Number.MAX_VALUE, y1: Number.MAX_VALUE, x2: -Number.MAX_VALUE, y2: -Number.MAX_VALUE };
            for (var i = 0; i < whiteboardItems.length; i++) {
                    t = whiteboardItems[i].getDimensions();

                    if (bounding.x1 > t.left)
                        bounding.x1 = t.left;
                    if (bounding.x2 < t.left + t.width)
                        bounding.x2 = t.left + t.width;
                    if (bounding.y1 > t.top)
                        bounding.y1 = t.top;
                    if (bounding.y2 < t.top + t.height)
                        bounding.y2 = t.top + t.height;               
            }
            return {
                left: bounding.x1, top: bounding.y1, width: bounding.x2 - bounding.x1, height: bounding.y2 - bounding.y1
            };            
        },         
        addItem(item) {           
            whiteboardItems.push(item);
        },
        handleDelete() {
            var newitems = [];
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (!whiteboardItems[i].getSelected())
                    newitems.push(whiteboardItems[i]);
            }
            whiteboardItems = newitems;
            this.redraw();
        },
        bringToFront() {
            var i = this.findwbItemIndexUnderMouse();
            
            if (i != undefined)
            {
                var item = whiteboardItems[i];                
                item.order = whiteboardItems[whiteboardItems.length - 1].order + 1000000;
                item.setDirty();
                array_move(whiteboardItems, i, whiteboardItems.length - 1);
                this.redraw();
            }
        },
        sendToBack(ii) {
            var i;
            if (ii != undefined)
                i = ii;
            else
                i = this.findwbItemIndexUnderMouse();
            if (i != undefined)
            {
                var item = whiteboardItems[i];
                item.order = Math.floor(whiteboardItems[0].order / 2);
                item.setDirty();

                array_move(whiteboardItems, i, 0);
                this.redraw();
            }
        },
        setLocked(truefalse) {
            var wi = this.findwbItemUnderMouse();
            if (wi != undefined) {
                if (wi.getSelected() == false) {
                    this.clearSelection()
                    wi.setSelected(true);
                    this.selectRelatedGroups();


                }
            }
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (whiteboardItems[i].getSelected() == true) {
                    whiteboardItems[i].setLocked(truefalse);
                }
            }
            this.redraw();
        },
        setBackgroundColor(color) {           
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (whiteboardItems[i].getSelected() == true) {
                    whiteboardItems[i].setBackgroundColor(color);
                }
            }
            this.redraw();
        },
        setShape: function (shape) {
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (whiteboardItems[i].getSelected() == true) {
                    whiteboardItems[i].setShape(shape);
                }
            }
            this.redraw();
        },
        group() {
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (whiteboardItems[i].getSelected() == true) {
                    whiteboardItems[i].setGroup(nextgroupid);
                }
            }
            nextgroupid++;
        },
        ungroup() {
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (whiteboardItems[i].getSelected() == true) {
                    whiteboardItems[i].setGroup();
                }
            }
        },
        addEmptyBox() {

            var wi = new wbItem();
            wi.initialize();
            whiteboardItems.push(wi);
            this.redraw();
        },
        addTextBox() {
            var wi = new wbItemTextEditor();
            wi.initialize();       
            whiteboardItems.push(wi);
            this.redraw();
        },
        getItems() {
            return whiteboardItems;

        },
        getItemByGUID(guid) {
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (whiteboardItems[i].getGUID() == guid) {
                    return whiteboardItems[i]
                }
            }           
        },

        setConsecutiveY(v)
        {
            consecutiveY = v;
        },
        getConsecutiveY()
        {
            return consecutiveY;
        },
        addFromImage(image) {
            var _this = this;
            image.onload = function () {
                console.log(this.width + 'x' + this.height);

                var initialDimensions = { top: lastY, left: lastX, width: this.width, height: this.height }
                var canvasdimensions = _this.convertWindowToCanvasCoordinates(initialDimensions);

                var wi = new wbItem();
                wi.initialize();
                wi.setImage(image);
                wi.setDimensions(canvasdimensions);
                whiteboardItems.push(wi);
                wi.imageDirty = true;
                _this.redraw();
            };
        },

        addFromImageConsecutive(image) {
            var _this = this;
            image.onload = function () {
                console.log(this.width + 'x' + this.height);
                var initialDimensions;
                if (_this.getConsecutiveY() == undefined)
                {
                     initialDimensions = { top: lastY, left: lastX, width: this.width, height: this.height }
                     _this.setConsecutiveY(lastY + this.height + 50);
                }
                else
                {
                    initialDimensions = { top: _this.getConsecutiveY(), left: lastX, width: this.width, height: this.height }
                    _this.setConsecutiveY(_this.getConsecutiveY() + this.height + 50);
                }
                var canvasdimensions = _this.convertWindowToCanvasCoordinates(initialDimensions);

                var wi = new wbItem();
                wi.initialize();
                wi.setImage(image);
                wi.setDimensions(canvasdimensions);
                whiteboardItems.push(wi);
                _this.redraw();
            };
        },

        respositionNonCanvasItems() {
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (whiteboardItems[i].getActive())
                    whiteboardItems[i].refreshPositioning();
            }
        },
        getZoomFactor: function () {
            return ctx.getTransform().a;
        },
        getCtx: function () {
            return ctx;
        },
        getLastMousePos: function () {
            return ctx.transformedPoint(lastX, lastY);
        },

        addFromRectangle(modelname, itemtype, color) {
            this.clearSelection();
            rectangleLoadData = { type: itemtype, extraData: modelname, backgroundColor:color };
        },
        getRectangleLoadData() {
            return rectangleLoadData;
        },
        loadFromLoadData() {
            var pt2 = ctx.transformedPoint(lastX, lastY);
            var pt1 = operator.dragStart;
            if (pt1.x > pt2.x)
            {
                var temp = pt1.x;
                pt1.x = pt2.x;
                pt2.x = temp;
            }
            if (pt1.y > pt2.y)
            {
                var temp = pt1.y;
                pt1.y = pt2.y;
                pt2.y = temp;
            }
            var dims = {
                left: pt1.x, top: pt1.y, width: pt2.x - pt1.x, height: pt2.y - pt1.y
            }
            if (rectangleLoadData.type == wbItemType.wbItemHC) {
                wbItemHC.create(rectangleLoadData.extraData, dims);               
            }
            else if (rectangleLoadData.type == wbItemType.wbItemTextEditorNote || rectangleLoadData.type == wbItemType.wbItemTextEditorText) {
                for (var i = 0; i < whiteboardItems.length; i++) {
                    if (whiteboardItems[i].getType() == wbItemType.wbItemTextEditor && whiteboardItems[i].getActive())
                        whiteboardItems[i].deactivate();
                }

                var wi = new wbItemTextEditor();
                wi.initialize();
                if (rectangleLoadData.type == wbItemType.wbItemTextEditorNote) {
                    wi.autoResizeText = true;
                    wi.setBackgroundColor(rectangleLoadData.backgroundColor);

                }
                else {
                    wi.autoResizeExtents = true;
                    wi.setBackgroundColor("rgb(255,255,255)");
//                    wi.borderWidth = 0;
                }

                wi.setDimensions(dims);
                whiteboardItems.push(wi);
                wi.activate(ctx);
                this.redraw();
            }
            else if (rectangleLoadData.type == wbItemType.wbItem) {
                var wi = new wbItem();
                wi.initialize();
                wi.setDimensions(dims);
                wi.setBackgroundColor(rectangleLoadData.backgroundColor);
                whiteboardItems.push(wi);
                this.sendToBack(whiteboardItems.length - 1);
                this.redraw();
            }
            else if (rectangleLoadData.type == wbItemType.wbItemContainer) {
                var wi = new wbItemContainer();
                wi.initialize();
                wi.setDimensions(dims);
                wi.setBackgroundColor(rectangleLoadData.backgroundColor);
                whiteboardItems.push(wi);
                this.sendToBack(whiteboardItems.length - 1);
                this.redraw();
            }
            else if (rectangleLoadData.type == wbItemType.wbItemModelTree) {
                var wi = new wbItemModelTree();
                wi.initialize();
                wi.setDimensions(dims);
                wi.setBackgroundColor(rectangleLoadData.backgroundColor);
                whiteboardItems.push(wi);
                this.redraw();
            }
            rectangleLoadData = undefined;
        },
        copy() {
            copyItems = [];
            if (!this.editorActive()) {
                for (var i = 0; i < whiteboardItems.length; i++) {
                    if (whiteboardItems[i].getSelected() == true) {
                        copyItems.push(whiteboardItems[i]);
                    }
                }
            }
        },
        editorActive() {
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (whiteboardItems[i].getType() == wbItemType.wbItemTextEditor && whiteboardItems[i].getActive() == true)
                    return true;
            }
            return false;
        },
        paste() {
            if (!this.editorActive()) {

                var proms = [];
                for (var i = 0; i < copyItems.length; i++) {
                    proms.push(copyItems[i].duplicate());
                }
                this.clearSelection();
                Promise.all(proms).then(function (dups) {

                    for (var i = 0; i < dups.length; i++) {
                        dups[i]._dimensions.left += 20
                        dups[i]._dimensions.top += 20
                        dups[i].setSelected(true);
                    }
                    wbManager.redraw();
                });
            }
        },
        async refreshAll() {
            wbItemHC.minFramerate = 0;
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (whiteboardItems[i].getSelected() == true) {
                    await this.deactivateAll(true);
                    await whiteboardItems[i].activate(ctx);
                }
            }
            wbItemHC.minFramerate = 50;
        },
        getDragStart() {
            return operator.dragStart;
        },
        getDirty() {
            return dirty;
        },
        setDirty() {
            dirty = true;
        },
        clearDirty() {
            dirty = false;
        },
     
        getTopOrder()
        {
            if (whiteboardItems.length > 0)
                return whiteboardItems[whiteboardItems.length-1].order + 1000000;
            else
                return 1000000;
        },
        async refreshItems(items)
        {
            for (var i=0;i<items.length;i++)
            {
                await items[i].activate(ctx);
                await items[i].deactivate();
                items[i].clearDirty();
            }
        },
  

    };
}

var wbManager = new wbManager_();