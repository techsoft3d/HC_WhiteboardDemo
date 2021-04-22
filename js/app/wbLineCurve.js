class wbLineCurve extends wbLine {


    constructor(p1, p2) {
        super(p1,p2);
        this.lineType = wbLineType.curve;        
        this.cp = [];    
        this.curveSubdivisions = 20;
   
       
    }


    recalculateLineData() {
        this.fitControlPoints();

        super.recalculateLineData();
    }


    updateCenterSnap(i) {
        var res = super.updateCenterSnap(i);
        this.adjustSnapCurve(i, res.position);
        return res;
    }

    adjustSnapCurve(s,snapposition) {
        var cpoffset = 100;
       
        var snapitem;
        var cp;
        if (s == 1) {
            snapitem = this.snapItems[1];
            cp = this.cp[this.cp.length - 2];
        }
        if (s == 0) {
            snapitem = this.snapItems[0];
            cp = this.cp[1];
        }
    
        var snappos; 
        if (snapposition != undefined)
            snappos = snapposition;
        else
            snappos = snapitem.position;


        var dims = snapitem.item.getDimensions();


        var x2 = dims.left + dims.width / 2;;
        var y2 = dims.top + dims.height / 2;
        if (snappos== snapPosition.left) {
            cp.x = dims.left - cpoffset;
            cp.y = y2;
        }
        else if (snappos == snapPosition.right) {
            cp.x = dims.left + dims.width + cpoffset;
            cp.y = y2;
        }
        else if (snappos == snapPosition.top) {
            cp.x = x2;
            cp.y = dims.top - cpoffset;
        }
        else if (snappos == snapPosition.bottom) {
            cp.x = x2;
            cp.y = dims.top + dims.height + cpoffset;
        }
    }

    
    fitControlPoints() {
        if (ctrlPressed)
            return;
        this.cp = [];

        for (var i = 0; i < this.points.length; i++) {
            if (i == 0) {
                this.cp = this.cp.concat(this.fitControlPointSet(this.points[0], this.points[0], this.points[1],0.3));
            }
            else if (i == this.points.length-1) {
                this.cp = this.cp.concat(this.fitControlPointSet(this.points[i-1], this.points[i], this.points[i],0.3));
            }           
            else
                this.cp = this.cp.concat(this.fitControlPointSet(this.points[i-1], this.points[i], this.points[i + 1], 0.3));

        }
       
        if (this.snapItems[1] != undefined) {
            if (this.snapItems[1].position == snapPosition.center)
                this.updateCenterSnap(1);
            else
                this.adjustSnapCurve(1)
        }

        if (this.snapItems[0] != undefined) {
            if (this.snapItems[0].position == snapPosition.center)
                this.updateCenterSnap(0);
            else
                this.adjustSnapCurve(0)
        }
    }

    bezierCurveToTessellated(startX, startY, m1x, m1y, m2x, m2y, ex, ey) {

        var verts = [];        

        var cp = [[startX, startY], [m1x, m1y], [m2x, m2y], [ex, ey]];
        for (var i = 0; i <= this.curveSubdivisions; i++) {
            var t = i / this.curveSubdivisions;
            var ax, bx, cx;
            var ay, by, cy;
            var tSquared, tCubed;

            /* c�lculo de los coeficientes polinomiales */
            cx = 3.0 * (cp[1][0] - cp[0][0]);
            bx = 3.0 * (cp[2][0] - cp[1][0]) - cx;
            ax = cp[3][0] - cp[0][0] - cx - bx;

            cy = 3.0 * (cp[1][1] - cp[0][1]);
            by = 3.0 * (cp[2][1] - cp[1][1]) - cy;
            ay = cp[3][1] - cp[0][1] - cy - by;

            /* calculate the curve point at parameter value t */
            tSquared = t * t;
            tCubed = tSquared * t;

            var x = (ax * tCubed) + (bx * tSquared) + (cx * t) + cp[0][0];
            var y = (ay * tCubed) + (by * tSquared) + (cy * t) + cp[0][1];
            verts.push(new Communicator.Point2(x, y));
           
        }
        return verts;
    }


    calculatePointCandidates() {
        this.pointCandidates = [];
        for (var i = 0; i < this.points.length - 1; i++) {

            var p1 = this.points[i];
            var p2 = this.points[i + 1];
            if (i < this.points.length - 1) {
                var verts = this.bezierCurveToTessellated(p1.x, p1.y, this.cp[2 * i + 1].x, this.cp[2 * i + 1].y, this.cp[2 * i + 2].x, this.cp[2 * i + 2].y, p2.x, p2.y);
                var candidate = verts[this.curveSubdivisions / 2]
                candidate.insertId = i;
                this.pointCandidates.push(candidate);
            }
        }

    }



    pointInsideItem(pt) {
        var d = this.getDimensions();
        if (pt.x >= d.left && pt.x <= d.left + d.width &&
            pt.y >= d.top && pt.y <= d.top + d.height) {
            for (var i = 0; i < this.points.length - 1; i++) {

                var p1 = this.points[i];
                var p2 = this.points[i + 1];
                if (i < this.points.length - 1) {
                    var verts = this.bezierCurveToTessellated(p1.x, p1.y, this.cp[2 * i + 1].x, this.cp[2 * i + 1].y, this.cp[2 * i + 2].x, this.cp[2 * i + 2].y, p2.x, p2.y);
                    for (var j = 0; j < verts.length - 1; j++) {
                        if (distToSegment(pt, verts[j], verts[j + 1]) < 5)
                            return true;

                    }
                }
            }          
        }
        return false;
    }



    fitControlPointSet(p0,p1,p2, t) {
        //  x0,y0,x1,y1 are the coordinates of the end (knot) pts of this segment
        //  x2,y2 is the next knot -- not connected here but needed to calculate p2
        //  p1 is the control point calculated here, from x1 back toward x0.
        //  p2 is the next control point, calculated here and returned to become the 
        //  next segment's p1.
        //  t is the 'tension' which controls how far the control points spread.

        //  Scaling factors: distances from this knot to the previous and following knots.
        var d01 = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
        var d12 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
       
        var fa = t * d01 / (d01 + d12);
        var fb = t - fa;

        var p1x = p1.x + fa * (p0.x - p2.x);
        var p1y = p1.y + fa * (p0.y - p2.y);

        var p2x = p1.x - fb * (p0.x - p2.x);
        var p2y = p1.y - fb * (p0.y - p2.y);

        return [new Communicator.Point2(p1x, p1y), new Communicator.Point2(p2x, p2y)];
    }
    


    render(ctx) {

        this.renderPre(ctx);

        ctx.save();
        ctx.fillStyle = this.borderColor;
        var n = this.points.length;
        var drawExtra = false;
        var verts = [];
        ctx.beginPath();
        for (var i = 0; i < this.points.length - 1; i++) {

            var p1 = this.points[i];
            var p2 = this.points[i + 1];

            var p1new = p1, p2new = p2;
            if (i == 0 || i == this.points.length - 2) {               

                if (i == 0 && this.drawStartArrow == true) {
                    var dir = Communicator.Point2.subtract(this.cp[1], p1);
                    var dist = Communicator.Point2.distance(this.cp[1], p1);
                    dir.x /= dist;
                    dir.y /= dist;
                    p1new = new Communicator.Point2(p1.x + dir.x * this.borderWidth, p1.y + dir.y * this.borderWidth)
                }
                if (i == this.points.length - 2 && this.drawEndArrow == true) {
                    var dir = Communicator.Point2.subtract(this.cp[this.cp.length - 2], p2);
                    var dist = Communicator.Point2.distance(this.cp[this.cp.length - 2], p2);
                    dir.x /= dist;
                    dir.y /= dist;
                    p2new = new Communicator.Point2(p2.x + dir.x * this.borderWidth, p2.y + dir.y * this.borderWidth)
                }
              
            }


            
            ctx.moveTo(p1new.x, p1new.y);
            if (i < this.points.length-1)
            ctx.bezierCurveTo(this.cp[2 * i+1].x, this.cp[2 * i+1].y, this.cp[2 * i + 2].x, this.cp[2 * i + 2].y, p2new.x, p2new.y);
            

//            verts = verts.concat(this.bezierCurveToTessellated(p1.x, p1.y, this.cp[2 * i + 1].x, this.cp[2 * i + 1].y, this.cp[2 * i + 2].x, this.cp[2 * i + 2].y, p2.x + dir.x * 5, p2.y + dir.y * 5));

        }
        ctx.stroke();
        ctx.closePath();

        this.renderPost(ctx);

    }

    move(x, y, relative) {
        super.move(x, y, relative);
        this.fitControlPoints();
    }

    updateSnappedLinePoints(i) {
        super.updateSnappedLinePoints(i);
        this.fitControlPoints();

    }

    drawArrows(ctx) {

        if (this.drawStartArrow)
            this.drawLineWithArrows(ctx, this.cp[1], this.points[0], 7, 13, true, false);
        if (this.drawEndArrow)
            this.drawLineWithArrows(ctx, this.cp[this.cp.length - 2], this.points[this.points.length - 1], 7, 13, true, false);

    }


};