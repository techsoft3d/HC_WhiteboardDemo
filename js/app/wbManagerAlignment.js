const snapType = {
    vcenter: 0,
    hcenter: 1,
};

function wbManagerAlignment_() {

    var tolerance = 20;
    var ctx;
    var snapArray = [];

    return {
        initialize: function (inputctx) {
            ctx = inputctx;
        },
        calculateAlignment: function (selectedOnly) {
            var bbox = wbManager.calculateSelectionBounding(false).bounding;
            snapArray = [];
            var items = wbManager.getItems();
            var t = tolerance / ctx.getTransform().a;
            var cx = (bbox.x1 + bbox.x2) / 2;
            var cy = (bbox.y1 + bbox.y2) / 2;
            var vcenter;
            var hcenter;

            for (var i = 0; i < items.length; i++) {
                if (items[i].getSelected() == false && items[i].getType() != wbItemType.wbLine) {                   
                    var b = items[i].getDimensions();
                    if (b.left + b.width < bbox.x1 || b.left > bbox.x2 ||
                        b.top + b.height < bbox.y1 || b.top > bbox.y2) {


                        var cx2 = b.left + b.width / 2;
                        var cy2 = b.top + b.height / 2;
                        if (cy > cy2 - t && cy < cy2 + t) {
                            var dist = Math.abs(cx - cx2);
                            if (vcenter == undefined || dist < vcenter.dist) {
                                if (cx2 < cx)
                                    vcenter = { type: snapType.vcenter, x1: bbox.x1, y1: cy2, x2: b.left + b.width, y2: cy2, dist: dist };
                                else
                                    vcenter = { type: snapType.vcenter, x1: bbox.x2, y1: cy2, x2: b.left, y2: cy2, dist: dist };
                            }
                        }
                        if (cx > cx2 - t && cx < cx2 + t) {
                            var dist = Math.abs(cy - cy2);
                            if (hcenter == undefined || dist < hcenter.dist) {
                                if (cy2 < cy)
                                    hcenter = { type: snapType.hcenter, y1: bbox.y1, x1: cx2, y2: b.top + b.height, x2: cx2, dist: dist };
                                else
                                    hcenter = { type: snapType.hcenter, y1: bbox.y2, x1: cx2, y2: b.top, x2: cx2, dist: dist };
                            }
                        }
                    }
                }

            }
            if (vcenter != undefined)
                snapArray.push(vcenter);
            if (hcenter != undefined)
                snapArray.push(hcenter);

            this.adjustAlignment(bbox, selectedOnly);
        },
        adjustAlignment: function (bbox,selectedOnly) {
            var newbbox = { x1: bbox.x1, x2: bbox.x2, y1: bbox.y1, y2: bbox.y2 };

            for (var i = 0; i < snapArray.length; i++) {
                var e = snapArray[i];
                if (e.type == snapType.vcenter) {
                    newbbox.y1 = e.y1-(newbbox.y2-newbbox.y1)/2;
                }
                else if (e.type == snapType.hcenter) {
                    newbbox.x1 = e.x1 - (newbbox.x2 - newbbox.x1) / 2;
                }
            }
            var deltay = bbox.y1 - newbbox.y1;
            var deltax = bbox.x1 - newbbox.x1;
            var items = wbManager.getItems();
            for (var i = 0; i < items.length; i++) {
                if (((items[i].getTempDimensions() != undefined && selectedOnly == false && items[i].containedIn == undefined) || items[i].getSelected())) {
                    var b = items[i].getDimensions();
                    items[i].move(b.left - deltax, b.top - deltay, false);
                }
            }
        },
        drawAlignment: function () {
            ctx.lineWidth = 1 / ctx.getTransform().a;
            ctx.setLineDash([5 / ctx.getTransform().a, 15 / ctx.getTransform().a]);

            for (var i = 0; i < snapArray.length; i++) {
                ctx.beginPath();
                ctx.moveTo(snapArray[i].x1, snapArray[i].y1);
                ctx.lineTo(snapArray[i].x2, snapArray[i].y2);
                ctx.stroke();

            }
            ctx.setLineDash([]);
        }

    }
};

var wbManagerAlignment = new wbManagerAlignment_();