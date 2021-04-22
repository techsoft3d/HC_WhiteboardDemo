class wbLineStep extends wbLine {


    constructor(p1, p2) {
        super(p1,p2);
        this.lineType = wbLineType.step;        
        this.segments = [];
        this.segments.push({ point1: undefined, point2: undefined, pt: undefined, isCandidate: true })
        this.segments.push({ point1: undefined, point2: undefined, pt: undefined, isCandidate: true })
        this.segments.push({ point1: undefined, point2: undefined, pt: undefined, isCandidate: true })
        this.start = true;
    }


    setFromJSON(res)
    {
        super.setFromJSON(res); 
        this.segments = res.segments;       
    }



    serialize() {
        var res = super.serialize();        
        res.segments = this.segments;

        return res;

    }


    findSelection(pt, tol) {
        for (var i = 0; i < this.segments.length; i++) {
            if (pt.x >= this.segments[i].pt.x - tol && pt.x <= this.segments[i].pt.x + tol &&
                pt.y >= this.segments[i].pt.y - tol && pt.y <= this.segments[i].pt.y + tol)
                return { id: i, isSegment: true};
        }

        for (var i = 0; i < this.points.length; i++) {
            if (pt.x >= this.points[i].x - tol && pt.x <= this.points[i].x + tol &&
                pt.y >= this.points[i].y - tol && pt.y <= this.points[i].y + tol) {
                return { id: i, isSegment: false };
            }
        }

        return undefined;
    }


    deletePoint(i) {
        if (i > 1) {
            if (this.segments[i].hor == false) {
                this.segments[i - 2].point2.x = this.segments[i].point2.x;
                this.segments[i + 1].point1 = this.segments[i - 2].point2;
            }
            else {
                this.segments[i - 2].point2.y = this.segments[i].point2.y;
                this.segments[i + 1].point1 = this.segments[i - 2].point2;
            }
        }

        this.segments.splice(i, 1);    
        this.segments.splice(i - 1, 1);
        this.recalculateLineData();        
    }

    adjustEndPoint(i) {

        if (i == 1) {
            var pt = this.points[1];
            this.segments[this.segments.length - 1].point2.x = pt.x;
            this.segments[this.segments.length - 1].point2.y = pt.y;
            if (this.segments[this.segments.length - 1].hor == true)
                this.segments[this.segments.length - 1].point1.x = pt.x;
            else
                this.segments[this.segments.length - 1].point1.y = pt.y;

        }
        else {
            var pt = this.points[0];
            this.segments[0].point1.x = pt.x;
            this.segments[0].point1.y = pt.y;
            if (this.segments[0].hor == true)
                this.segments[0].point2.x = pt.x;
            else
                this.segments[0].point2.y = pt.y;

        }
    }


    dragPoint(info, pt) {

        if (info.isCandidate == undefined && this.segments[info.id].isCandidate == true && info.isSegment == true) {
            this.segments[info.id].isCandidate = false;
            if (info.id == this.segments.length - 1) {
                var newsegment = { point1: undefined, point2: undefined, pt: undefined, isCandidate: true };
                newsegment.point1 = this.segments[this.segments.length - 1].point2;
                newsegment.point2 = this.segments[this.segments.length - 1].point2.copy();
                newsegment.hor = !this.segments[this.segments.length - 1].hor;
                this.segments.push(newsegment);
                this.segments[info.id].isCandidate = false;
            }
            if (info.id == 0) {
                var newsegment = { point1: undefined, point2: undefined, pt: undefined, isCandidate: true };
                newsegment.point1 = this.segments[0].point1.copy();
                newsegment.point2 = this.segments[0].point1;
                newsegment.hor = !this.segments[0].hor;
                this.segments.splice(0, 0, newsegment);
                info.id = 1;
            }
            this.start = false;
           
        }
        else {
            if (info.isCandidate != undefined || info.isSegment == false) {
                var res = this.snapToWindow(pt, info.id);
                if (res != undefined)
                    pt = res;

                this.points[info.id].x = pt.x;
                this.points[info.id].y = pt.y;
                if (info.isSegment == false) {
                    this.adjustEndPoint(info.id);
                }

            }
            if (info.isSegment == true) {
                var segment = this.segments[info.id];
                if (segment.hor == true) {
                    segment.pt.x = pt.x;
                    segment.point1.x = pt.x;
                    segment.point2.x = pt.x;
                }
                else {
                    segment.pt.y = pt.y;
                    segment.point1.y = pt.y;
                    segment.point2.y = pt.y;
                }
            }
        }
                    
        this.recalculateLineData();
    }        


    calculateSteps(calculateCandidates) {
        var tol = 5;
        var curx = this.points[0].x;
        var cury = this.points[0].y;     


        if (this.start == true) {
           
            this.segments[0].point1 = new Communicator.Point2(this.points[0].x, this.points[0].y);
            this.segments[0].point2 = new Communicator.Point2((this.points[0].x + this.points[1].x) / 2, this.points[0].y);
            this.segments[0].hor = false;

            this.segments[1].point1 = this.segments[0].point2;
            this.segments[1].point2 = new Communicator.Point2((this.points[0].x + this.points[1].x) / 2, this.points[1].y);
            this.segments[1].hor = true;

            this.segments[2].point1 = this.segments[1].point2;
            this.segments[2].point2 = new Communicator.Point2(this.points[1].x, this.points[1].y);
            this.segments[2].hor = false;

            for (var i = 0; i < this.segments.length; i++) {
                this.segments[i].pt = new Communicator.Point2((this.segments[i].point1.x + this.segments[i].point2.x) / 2, (this.segments[i].point1.y + this.segments[i].point2.y) / 2);
            }        
        }
        else {

            for (var i = 0; i < this.segments.length; i++) {
                this.segments[i].pt = new Communicator.Point2((this.segments[i].point1.x + this.segments[i].point2.x) / 2, (this.segments[i].point1.y + this.segments[i].point2.y) / 2);
            }     
            this.points[0] = this.segments[0].point1.copy();
            this.points[1] = this.segments[this.segments.length-1].point2.copy();
        }

    }

    addCandidate(p1, p2, hor,i) {
        var candidate = new Communicator.Point2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
        candidate.insertId = i;
        candidate.hor = hor;
        this.pointCandidates.push(candidate);
    }


    render(ctx) {

        this.renderPre(ctx);

        ctx.save();
        ctx.fillStyle = this.borderColor;
        var n = this.points.length;
        var drawExtra = false;
        var verts = [];
        var tol = 5;

        this.calculateSteps(false);
        ctx.beginPath();

        if (!this.drawStartArrow)
            ctx.moveTo(this.segments[0].point1.x, this.segments[0].point1.y);
        else {
            var pt = this.arrowLine(this.segments[0].point1, this.segments[1].point1)
            ctx.moveTo(pt.x, pt.y);
        }
  
        for (var i = 1; i < this.segments.length; i++)
            ctx.lineTo(this.segments[i].point1.x, this.segments[i].point1.y);
        if (!this.drawEndArrow)
            ctx.lineTo(this.segments[this.segments.length - 1].point2.x, this.segments[this.segments.length - 1].point2.y);
        else {
            var pt = this.arrowLine(this.segments[this.segments.length - 1].point2, this.segments[this.segments.length - 1].point1);
            ctx.lineTo(pt.x, pt.y);
        }

        ctx.stroke();
        ctx.closePath();
        this.renderPost(ctx);

    }
    
    calculatePointCandidates() {
        this.calculateSteps(true);
       
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

        var lastPoint = undefined;
        for (var i = 0; i < this.segments.length; i++) {
            if (lastPoint != this.segments[i].point1) {
                var dx = this.segments[i].point1.x - dims.left;
                var dy = this.segments[i].point1.y - dims.top;

                this.segments[i].point1.x = dims.left + dx / factorx;
                this.segments[i].point1.y = dims.top + dy / factory;
                this.segments[i].point1.x -= deltax;
                this.segments[i].point1.y -= deltay;

                lastPoint = this.segments[i].point1;
            }
            if (lastPoint != this.segments[i].point2) {
                var dx = this.segments[i].point2.x - dims.left;
                var dy = this.segments[i].point2.y - dims.top;

                this.segments[i].point2.x = dims.left + dx / factorx;
                this.segments[i].point2.y = dims.top + dy / factory;
                this.segments[i].point2.x -= deltax;
                this.segments[i].point2.y -= deltay;
                lastPoint = this.segments[i].point2;
            }
        }



        this.recalculateLineData();
        this._dimensions = newdims;
    }



    move(x, y, relative) {
        var dims = this.getDimensions();

        var deltax = dims.left - x;
        var deltay = dims.top - y;
        if (relative) {
            deltax = -x;
            deltay = -y;
        }

        for (var i = 0; i < this.points.length; i++) {
            this.points[i].x -= deltax;
            this.points[i].y -= deltay;
        }

        var lastPoint = undefined;
        for (var i = 0; i < this.segments.length; i++) {
            if (lastPoint != this.segments[i].point1) {
                this.segments[i].point1.x -= deltax;
                this.segments[i].point1.y -= deltay;
                lastPoint = this.segments[i].point1;
            }
            if (lastPoint != this.segments[i].point2) {
                this.segments[i].point2.x -= deltax;
                this.segments[i].point2.y -= deltay;
                lastPoint = this.segments[i].point2;
            }
        }
     
        if (relative) {
            this._dimensions.left += x;
            this._dimensions.top += y;
        }
        else {
            this._dimensions.left = x;
            this._dimensions.top = y;
        }

        this.refreshPositioning();

    }


    updateCenterSnap(i) {
        var x2, y2;
        var x1, y1;
        var maxdist = Number.MAX_VALUE;
        var item = this.snapItems[i].item;
        var hor,dist;

        if (i == 0) {
            x1 = this.segments[0].point2.x;
            y1 = this.segments[0].point2.y;
            hor = this.segments[0].hor;
        }
        else {
            x1 = this.segments[this.segments.length - 1].point1.x;
            y1 = this.segments[this.segments.length - 1].point1.y;
            hor = this.segments[this.segments.length-1].hor;
        }


        x2 = Number.MAX_VALUE;
        y2 = Number.MAX_VALUE;

        var dims = item.getDimensions();
        if (!hor) {
            
            x2t = dims.left;
            y2t = dims.top + dims.height / 2;
            dist = Math.sqrt(Math.pow(x2t - x1, 2) + Math.pow(y2t - y1, 2));
            if (dist < maxdist) {
                maxdist = dist;
                x2 = x2t;
                y2 = y2t;
            }

            var x2t = dims.left + dims.width;
            var y2t = dims.top + dims.height / 2;
            var dist = Math.sqrt(Math.pow(x2t - x1, 2) + Math.pow(y2t - y1, 2));
            if (dist < maxdist) {
                maxdist = dist;
                x2 = x2t;
                y2 = y2t;
            }
        }
        else {

            x2t = dims.left + dims.width / 2;
            y2t = dims.top;
            dist = Math.sqrt(Math.pow(x2t - x1, 2) + Math.pow(y2t - y1, 2));
            if (dist < maxdist) {
                maxdist = dist;
                x2 = x2t;
                y2 = y2t;
            }

            x2t = dims.left + dims.width / 2;
            y2t = dims.top + dims.height;
            dist = Math.sqrt(Math.pow(x2t - x1, 2) + Math.pow(y2t - y1, 2));
            if (dist < maxdist) {
                maxdist = dist;
                x2 = x2t;
                y2 = y2t;
            }
        }
        return { x: x2, y: y2 };

    }



    recalculateBounding() {
        var dims = this.getDimensions();
        var bounding = { x1: Number.MAX_VALUE, y1: Number.MAX_VALUE, x2: -Number.MAX_VALUE, y2: -Number.MAX_VALUE };
        for (var i = 0; i < this.segments.length; i++) {
            if (this.segments[i].point1 != undefined) {
                if (bounding.x1 > this.segments[i].point1.x)
                    bounding.x1 = this.segments[i].point1.x;
                if (bounding.x2 < this.segments[i].point1.x)
                    bounding.x2 = this.segments[i].point1.x;
                if (bounding.y1 > this.segments[i].point1.y)
                    bounding.y1 = this.segments[i].point1.y;
                if (bounding.y2 < this.segments[i].point1.y)
                    bounding.y2 = this.segments[i].point1.y;
            }
        }
        if (this.segments[0].point1 != undefined) {
            if (bounding.x1 > this.segments[this.segments.length - 1].point2.x)
                bounding.x1 = this.segments[this.segments.length - 1].point2.x;
            if (bounding.x2 < this.segments[this.segments.length - 1].point2.x)
                bounding.x2 = this.segments[this.segments.length - 1].point2.x;
            if (bounding.y1 > this.segments[this.segments.length - 1].point2.y)
                bounding.y1 = this.segments[this.segments.length - 1].point2.y;
            if (bounding.y2 < this.segments[this.segments.length - 1].point2.y)
                bounding.y2 = this.segments[this.segments.length - 1].point2.y;
        }
        dims.left = bounding.x1 - 25;
        dims.top = bounding.y1 - 25;
        dims.width = bounding.x2 - bounding.x1 + 50;
        dims.height = bounding.y2 - bounding.y1 + 50;
    }

    pointInsideItem(pt) {
        var d = this.getDimensions();
        if (pt.x >= d.left && pt.x <= d.left + d.width &&
            pt.y >= d.top && pt.y <= d.top + d.height) {
            for (var i = 0; i < this.segments.length; i++) {
                if (distToSegment(pt, this.segments[i].point1, this.segments[i].point2) < 5)
                    return true;

            }
        }
        return false;
    }


    finalizePointDrag(pickedHandle) {

        for (var i = 0; i < this.segments.length; i++) {
            if (Math.abs(this.segments[i].point1.x - this.segments[i].point2.x) < 5 && Math.abs(this.segments[i].point1.y - this.segments[i].point2.y) < 5) {
                if (i > 1) {
                    this.segments[i + 1].point1 = this.segments[i - 1].point1;
                    this.segments.splice(i, 1);
                    this.segments.splice(i - 1, 1);
                }
                else {
                    this.segments[i - 1].point2 = this.segments[i + 1].point2;
                    this.segments.splice(i, 1);
                    this.segments.splice(i, 1);
                }

            }       
        }      
    }

    drawPoints(ctx) {
        if (this.getSelected() && wbManager.getCachedSelectedItems().length == 1) {
            ctx.save();
            ctx.strokeStyle = "rgb(0,0,0)";
            ctx.fillStyle = "rgb(255,255,255)";
            ctx.setLineDash([]);
            for (var i = 0; i < this.segments.length; i++) {
                if (this.segments[i].isCandidate ==  false)
                    this.drawPoint(ctx, this.segments[i].pt, 3.5);
            }

            for (var i = 0; i < this.points.length; i++) {
                    this.drawPoint(ctx, this.points[i], 3.5);
            }

            ctx.strokeStyle = "rgb(255,255,255)";
            ctx.fillStyle = "rgb(160, 160, 255)";
            for (var i = 0; i < this.segments.length; i++) {
                if (this.segments[i].isCandidate == true)
                    this.drawPoint(ctx, this.segments[i].pt, 3.5);
            }
            ctx.restore();
        }
    }


    drawArrows(ctx) {
        if (this.drawStartArrow)
            this.drawLineWithArrows(ctx, this.segments[0].point2, this.segments[0].point1, 7, 13, true, false);
        if (this.drawEndArrow)
            this.drawLineWithArrows(ctx, this.segments[this.segments.length - 1].point1, this.segments[this.segments.length - 1].point2, 7, 13, true, false);

    }
    
};