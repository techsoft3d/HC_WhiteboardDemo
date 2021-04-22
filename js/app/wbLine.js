const wbLineType = {
    straight: 0,
    curve: 1,
    step: 2
};

const snapPosition = {
    left: 0,
    right: 1,
    top: 2,
    bottom: 3,
    center:4,
};



function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist2(p, {
        x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y)
    });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

class wbLine extends wbItem  {

    static lineSnapItem = undefined;

    static newLineMode = undefined;

    static pickTolerance = 15;

    static setNewLineMode(type) {
        wbLine.newLineMode = type;
    }

    static checkAndStartNewLine(p, itemundermouse) {
        if (wbLine.newLineMode != undefined) {
            var line;
            if (wbLine.newLineMode == wbLineType.straight)
                line = new wbLine(new Communicator.Point2(p.x, p.y), new Communicator.Point2(p.x, p.y));
            else if (wbLine.newLineMode == wbLineType.curve)
                line = new wbLineCurve(new Communicator.Point2(p.x, p.y), new Communicator.Point2(p.x, p.y));    
            else
                line = new wbLineStep(new Communicator.Point2(p.x, p.y), new Communicator.Point2(p.x, p.y));    

            line.initialize();

            if (itemundermouse!=undefined)
            {
                line.setSnapItem(0, itemundermouse,  snapPosition.center);
            }
            var myHandleInfo = new handleInfo(handleTypes.dragLinePoint);


            wbLine.addLine(line);
            myHandleInfo.extra = {
                line: line, pointinfo: { id: 1, isCandidate: false }
            };
            wbLine.newLineMode = undefined;
            return myHandleInfo;
        }
        else
            return undefined;
    }



    static addLine(line) {
        var items = wbManager.getItems()
        items.push(line);
    }

    static deletePointFromDoubleClick(pt) {
        var tol = wbLine.pickTolerance / wbManager.getZoomFactor();
        var line = wbLine.getSingleSelectedLine()
        if (line != undefined) {
            var selection = line.findSelection(pt, tol);
            if (selection != undefined && (selection.isCandidate == undefined || selection.isCandidate == false)) {
                line.deletePoint(selection.id);
                return true;
            }
        }
        return false;
    }

    static getSingleSelectedLine() {
        var items = wbManager.getCachedSelectedItems()
        if (items.length == 1 && items[0].getType() == wbItemType.wbLine)
            return items[0];
        else
            return undefined;
    }

    static checkAndStartLinePointSelection(pt) {
        var tol = wbLine.pickTolerance / wbManager.getZoomFactor();
        var line = wbLine.getSingleSelectedLine();
        if (line != undefined) {
            var selection = line.findSelection(pt, tol);
            if (selection != undefined) {
                var myHandleInfo = new handleInfo(handleTypes.dragLinePoint);
                myHandleInfo.extra = { line: line, pointinfo: selection };
                return myHandleInfo;
            }
        }
        return undefined;
    }

    static dragLinePointSelection(pt,pickedHandle) {
        if (pickedHandle != undefined && pickedHandle.type == handleTypes.dragLinePoint) {
            pickedHandle.extra.line.dragPoint(pickedHandle.extra.pointinfo, pt, wbManager.getZoomFactor(), true);
            wbManager.redraw();
            return true;
        }
        return false;
    }

    static finalizePointDrag(pickedHandle) {
        if (pickedHandle != undefined && pickedHandle.type == handleTypes.dragLinePoint) 
            pickedHandle.extra.line.finalizePointDrag(pickedHandle);
    }


    static updateAllSnappedLinePoints() {
        var items = wbManager.getCachedLineItems();        
        for (var i = 0; i < items.length; i++)
        {
            if (items[i].snapItems[0] != undefined)
                items[i].updateSnappedLinePoints(0);
            if (items[i].snapItems[1] != undefined)
                items[i].updateSnappedLinePoints(1);
        }

    }

    static updateAllLineData() {
        var items = wbManager.getCachedLineItems();
        for (var i = 0; i < items.length; i++) {
            items[i].recalculateLineData();
        }

    }

    constructor(p1, p2) {
        super();
        this.shadowWidth = 0;
        this._type = wbItemType.wbLine;
        this.lineType = wbLineType.straight;      
        this.points = [];
        this.pointCandidates = [];
        this.points.push(p1);
        this.points.push(p2);
        this.drawStartArrow = false;
        this.drawEndArrow = true;
        this.borderWidth = 3;
        this.snapItems = [undefined, undefined];
       
    }




    initialize() {        
        this.recalculateLineData();
    }

    finalizePointDrag(pickedHandle) {
    }

    setDrawArrows(drawStartArrow, drawEndArrow) {
        this.drawStartArrow = drawStartArrow;
        this.drawEndArrow = drawEndArrow;

    }


    setSnapItem(i, item, position) {
        this.snapItems[i] = { item: item, position: position };
    }
    
    move(x, y, relative) {
        var dims = this.getDimensions();
        if (relative) {

            for (var i = 0; i < this.points.length; i++) {
                this.points[i].x += x;
                this.points[i].y += y;
            }
        }
        else {
            var deltax = dims.left - x;
            var deltay = dims.top - y;
            for (var i = 0; i < this.points.length; i++) {
                this.points[i].x -= deltax;
                this.points[i].y -= deltay;
            }
        }
        super.move(x, y, relative);

    }

    scale(newdims) {
        var dims = this.getDimensions();
        var factorx = dims.width / newdims.width;
        var factory = dims.height / newdims.height;
        var deltax = dims.left - newdims.left;
        var deltay = dims.top - newdims.top;


        for (var i = 0; i < this.points.length; i++) {
            var dx = this.points[i].x - dims.left;
            var dy = this.points[i].y - dims.top;

            this.points[i].x = dims.left + dx / factorx;
            this.points[i].y = dims.top + dy / factory;
            this.points[i].x -= deltax;
            this.points[i].y -= deltay;
        }
        this.recalculateLineData();
        this._dimensions = newdims;
    }
   


    recalculateBounding() {
       
        var dims = this.getDimensions();
        var bounding = { x1: Number.MAX_VALUE, y1: Number.MAX_VALUE, x2: -Number.MAX_VALUE, y2: -Number.MAX_VALUE };
        for (var i = 0; i < this.points.length; i++) {
            if (bounding.x1 > this.points[i].x)
                bounding.x1 = this.points[i].x;
            if (bounding.x2 < this.points[i].x)
                bounding.x2 = this.points[i].x;
            if (bounding.y1 > this.points[i].y)
                bounding.y1 = this.points[i].y;
            if (bounding.y2 < this.points[i].y)
                bounding.y2 = this.points[i].y;
        }
        dims.left = bounding.x1-25;
        dims.top = bounding.y1-25;
        dims.width = bounding.x2 - bounding.x1 + 50;
        dims.height = bounding.y2 - bounding.y1 + 50;
    }

    recalculateLineData() {
        this.recalculateBounding();
        this.calculatePointCandidates();
    }

    calculatePointCandidates() {
        this.pointCandidates = [];
        for (var i = 0; i < this.points.length - 1; i++) {
            this.pointCandidates.push(new Communicator.Point2((this.points[i].x + this.points[i + 1].x) / 2, (this.points[i].y + this.points[i + 1].y) / 2));
        }
    }

    addPoint(p) {
        this.points.push(p);
    }

    deletePoint(i) {
        if (this.points.length > 2) {
            this.points.splice(i, 1);
            this.recalculateLineData();
        }
    }

    findSelection(pt, tol) {
        for (var i = 0; i < this.points.length; i++) {
            if (pt.x >= this.points[i].x - tol && pt.x <= this.points[i].x + tol &&
                pt.y >= this.points[i].y - tol && pt.y <= this.points[i].y + tol)
                return { id: i, isCandidate: false, hor: this.points[i].hor, pt:this.points[i] };
        }

        for (var i = 0; i < this.pointCandidates.length; i++) {
            if (pt.x >= this.pointCandidates[i].x - tol && pt.x <= this.pointCandidates[i].x + tol &&
                pt.y >= this.pointCandidates[i].y - tol && pt.y <= this.pointCandidates[i].y + tol) {

                if (this.pointCandidates[i].insertId == undefined)
                    return { id: i, isCandidate: true, hor: this.pointCandidates[i].hor, pt: this.pointCandidates[i] };
                else
                    return { id: this.pointCandidates[i].insertId, isCandidate: true, hor: this.pointCandidates[i].hor, pt:this.pointCandidates[i]};
            }
        }

        return undefined;
    }

    dragPoint(info, pt) {

        if (info.isCandidate == true) {
            this.points.splice(info.id + 1, 0, new Communicator.Point2(pt.x, pt.y));
            info.isCandidate = false
            info.id = info.id + 1;
        }
        else {          
            if (info.id == 0 || info.id == this.points.length - 1) {
                var res = this.snapToWindow(pt,info.id);
                if (res != undefined) {
                    this.points[info.id].x = res.x;
                    this.points[info.id].y = res.y;
                    this.recalculateLineData()
                    return;
                }
            }
            this.points[info.id].x = pt.x;
            this.points[info.id].y = pt.y;
        }
        this.setDirty();
        this.recalculateLineData();
    }        

    checkClose(x1, y1, x2, y2, tol) {
        if (x1 >= x2 - tol && x1 <= x2 + tol &&
            y1 >= y2 - tol && y1 <= y2 + tol)
            return true;
        else
            return false;
    }

    adjustEndPoint(i) {

    }

    updateSnappedLinePoints(i) {
        this.setDirty();
        var snapitem = this.snapItems[i];

        var x1, y1;
        var dims = snapitem.item.getDimensions();
        if (snapitem.position == snapPosition.left) {
            x1 = dims.left;
            y1 = dims.top + dims.height / 2;
        }
        else if (snapitem.position == snapPosition.right) {
            x1 = dims.left + dims.width;
            y1 = dims.top + dims.height / 2;
        }
        else if (snapitem.position == snapPosition.top) {
            x1 = dims.left + dims.width / 2;
            y1 = dims.top;
        }
        else if (snapitem.position == snapPosition.bottom) {
            x1 = dims.left + dims.width / 2;
            y1 = dims.top + dims.height;
        }
        else if (snapitem.position == snapPosition.center) {
            var res = this.updateCenterSnap(i);
            x1 = res.x;
            y1 = res.y;
        }
        if (i == 0) {
            this.points[0].x = x1;
            this.points[0].y = y1;
            this.adjustEndPoint(0);
        }
        else {
            this.points[this.points.length-1].x = x1;
            this.points[this.points.length - 1].y = y1;
            this.adjustEndPoint(1);
        }
          
    }

    updateCenterSnap(i) {
        var x2, y2;
        var x1, y1;
        var maxdist;
        var item = this.snapItems[i].item;

        if (i == 0) {
            x1 = this.points[1].x;
            y1 = this.points[1].y;
        }
        else {
            x1 = this.points[this.points.length - 2].x;
            y1 = this.points[this.points.length - 2].y;
        }
        
        var dims = item.getDimensions();
        x2 = dims.left;
        y2 = dims.top + dims.height / 2;
        var pos = snapPosition.left

        maxdist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
       

        var x2t = dims.left + dims.width;
        var y2t = dims.top + dims.height / 2;
        var dist = Math.sqrt(Math.pow(x2t - x1, 2) + Math.pow(y2t - y1, 2));
        if (dist < maxdist) {
            maxdist = dist;
            x2 = x2t;
            y2 = y2t;
            pos = snapPosition.right
        }


        x2t = dims.left + dims.width / 2;
        y2t = dims.top;
        dist = Math.sqrt(Math.pow(x2t - x1, 2) + Math.pow(y2t - y1, 2));
        if (dist < maxdist) {
            maxdist = dist;
            x2 = x2t;
            y2 = y2t;
            pos = snapPosition.top
        }

        x2t = dims.left + dims.width / 2;
        y2t = dims.top + dims.height;
        dist = Math.sqrt(Math.pow(x2t - x1, 2) + Math.pow(y2t - y1, 2));
        if (dist < maxdist) {
            maxdist = dist;
            x2 = x2t;
            y2 = y2t;
            pos = snapPosition.bottom
        }

        return { x: x2, y: y2, position:pos};
   
    }

    

    snapToWindow(pt,id) {
        var tol = 25 / wbManager.getZoomFactor();
        //  var cpoffset = 60 / tf;

//        var cpoffset = Math.sqrt(Math.pow(cp[cp1] - pts[cpid], 2) + Math.pow(cp[cp1 + 1] - pts[cpid + 1], 2));
        var cpoffset = 500;
        if (wbLine.lineSnapItem) {
            wbLine.lineSnapItem.isLineSnapItem = false;
            wbLine.lineSnapItem =undefined
        }

        var snapItem;
        if (id == this.points.length - 1) {
            snapItem = 1
        }
        else {
            snapItem = 0;
        }
        this.snapItems[snapItem] = undefined;

        var items = wbManager.getItems();
        for (var i = 0; i < items.length; i++) {
            if (items[i].getType() != wbItemType.wbLine) {
                if (items[i].pointInsideItemWithTolerance(pt, 35)) {
                    if (wbLine.lineSnapItem) 
                        wbLine.lineSnapItem.isLineSnapItem = false;

                    items[i].isLineSnapItem = true;
                    wbLine.lineSnapItem = items[i];
                    items[i].isLineSnapItem = true;
                    var dims = items[i].getDimensions();
                    var x2 = dims.left;
                    var y2 = dims.top + dims.height / 2;
                   
                    if (this.checkClose(pt.x, pt.y, x2, y2, tol)) {
                        this.snapItems[snapItem] = { item: items[i], position: snapPosition.left };

                        return { x: x2, y: y2 };
                    }
                    x2 = dims.left + dims.width;
                    y2 = dims.top + dims.height / 2;
                    if (this.checkClose(pt.x, pt.y, x2, y2, tol)) {
                        this.snapItems[snapItem] = { item: items[i], position: snapPosition.right };

                        return { x: x2, y: y2 };
                    }
                    x2 = dims.left + dims.width / 2;
                    y2 = dims.top;
                    if (this.checkClose(pt.x, pt.y, x2, y2, tol)) {
                        this.snapItems[snapItem] = { item: items[i], position: snapPosition.top };

                        return { x: x2, y: y2 };
                    }
                    x2 = dims.left + dims.width / 2;
                    y2 = dims.top + dims.height;
                    if (this.checkClose(pt.x, pt.y, x2, y2, tol)) {
                        this.snapItems[snapItem] = { item: items[i], position: snapPosition.bottom };
                        return { x: x2, y: y2 };
                    }
                    x2 = dims.left + dims.width / 2;
                    y2 = dims.top + dims.height / 2;
                    if (this.checkClose(pt.x, pt.y, x2, y2, tol)) {
                        this.snapItems[snapItem] = { item: items[i], position: snapPosition.center };
                        return { x: x2, y: y2 };
                    }
                }
            }
        }
        return undefined;
    }




    pointInsideItem(pt) {

        if (super.pointInsideItem(pt)) {
            for (var i = 0; i < this.points.length - 1; i++) {
                if (distToSegment(pt, this.points[i], this.points[i + 1]) < 5)
                    return true;
            }
        }
        return false;
    }


    


    arrowLine(pt1, pt2) {
        var dir = Communicator.Point2.subtract(pt2, pt1);
        var dist = Communicator.Point2.distance(pt2, pt1);
        dir.x /= dist;
        dir.y /= dist;
        return (new Communicator.Point2(pt1.x + dir.x * this.borderWidth, pt1.y + dir.y * this.borderWidth));
    }

    render(ctx) {

        this.renderPre(ctx);

        ctx.save();
        ctx.lineJoin = "round";
        ctx.fillStyle = this.borderColor;
        var n = this.points.length;
        var drawExtra = false;
        ctx.beginPath();
        if (!this.drawStartArrow)
            ctx.moveTo(this.points[0].x, this.points[0].y);
        else {
            var pt = this.arrowLine(this.points[0], this.points[1])
            ctx.moveTo(pt.x, pt.y);
        }
        for (var i = 1; i < this.points.length-1; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }      

        if (!this.drawEndArrow)
            ctx.lineTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
        else {
            var pt = this.arrowLine(this.points[this.points.length - 1], this.points[this.points.length - 2])
            ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        this.renderPost(ctx);
    
    }

    renderPost(ctx) {
        this.drawPoints(ctx);
        this.drawArrows(ctx);
        ctx.restore();
    }

    drawPoints(ctx) {
        if (this.getSelected() && wbManager.getCachedSelectedItems().length == 1) {
            ctx.save();
            ctx.setLineDash([]);
            ctx.strokeStyle = "rgb(0,0,0)";
            ctx.fillStyle = "rgb(255,255,255)";
            this.drawPoint(ctx, this.points[0], 5);
            for (var i = 1; i < this.points.length; i++) {
                this.drawPoint(ctx, this.points[i], 5);
            }

            ctx.strokeStyle = "rgb(255,255,255)";
            ctx.fillStyle = "rgb(160, 160, 255)";
            for (var i = 0; i < this.pointCandidates.length; i++) {
                this.drawPoint(ctx, this.pointCandidates[i], 5);
            }
            ctx.restore();
        }
    }

    drawArrows(ctx) {

        if (this.drawStartArrow)
            this.drawLineWithArrows(ctx, this.points[1], this.points[0], 7, 13, true, false);
        if (this.drawEndArrow)
            this.drawLineWithArrows(ctx, this.points[this.points.length - 2], this.points[this.points.length - 1], 7, 13, true, false);

    }

    drawLineWithArrows(ctx, p1, p0, aWidth, aLength, arrowStart, arrowEnd) {
        if (this.borderWidth < 4) {
            aWidth = 7;
            aLength = 13;
        }
        else {
            aWidth = 2 * this.borderWidth * 0.9;
            aLength = 4 * this.borderWidth * 0.9;
        }
        var dx = p1.x - p0.x;
        var dy = p1.y - p0.y;
        var angle = Math.atan2(dy, dx);
        var length = Math.sqrt(dx * dx + dy * dy);

        ctx.save();
        ctx.translate(p0.x, p0.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(aLength, -aWidth);
        ctx.lineTo(0, 0);
        ctx.lineTo(aLength, aWidth);
        ctx.lineTo(aLength, -aWidth);
        ctx.fill();
        ctx.restore();
    }

};