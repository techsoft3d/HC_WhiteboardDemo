const wbItemType = {
    wbItem: 0,
    wbItemHC: 1,
    wbItemTextEditor: 2,
    wbItemTextEditorNote: 3,
    wbItemTextEditorText: 4,
    wbItemContainer: 5,
    wbItemModelTree: 6,
    wbLine:7
};

const wbItemShape = {
    rectangle: 0,
    roundedCornerRectangle: 1,
    circle: 2
};




class wbItem {

    static borderPatterns = [[1, 1], [5, 15], [20,5]];

    constructor() {
        this._type = wbItemType.wbItem;        
        this._active = false;
        this._locked = false;
        this._dimensions = { left: 600, top: 200, width: 500, height: 500 };
        this._tempcanvasimagedimensions;
        this._isSelected = false;
        this._shape = wbItemShape.rectangle;
        this._backgroundColor = "rgb(255,255,255)";
        this._groupid;
        this._image;
        this._targetdiv;
        this.containedIn = undefined;
        this._connectedWindows = [];
        this.backgroundOpacity = 1.0;
        this.borderColor = "rgb(0,0,0)";
        this.borderWidth = 1;
        this.shadowWidth = 2;
        this.borderPattern = undefined;
        this._guid = this._generateGUID();   
        this.isLineSnapItem = false;
        this.dirty = true;
        this.imageDirty = false;
        this.order = wbManager.getTopOrder();
        
    }


    
   _generateGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        })
    }

    setDirty()
    {
        this.dirty = true;
    }

    getDirty()
    {
        return this.dirty;
    }

    clearDirty()
    {
        this.dirty = false;
    }


    fetchImage(whiteboardid)
    {
        var _this = this;
        fetch('api/Image/' + whiteboardid + '/' + this._guid)
        .then(
            function (response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    return;
                }
                // Examine the text in the response
                response.json().then(function (data) {       
                    var r = JSON.parse(data);
                    let img = document.createElement('img')
                    img.src = r.test;
                    _this.setImage(img);
                    setTimeout(function () {
                        wbManager.redraw();
                    }, 200);
                });
            }
        )
            .catch(function (err) {
                console.log('Fetch Error :-S', err);
            });
    }

    postImage(whiteboardid) {
        var _this = this;
        fetch('api/Image/' + whiteboardid + "/" + this._guid, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ test: _this._image.src })
        });
    }

    setupDiv(containerid) {
        this._targetdiv = "wdiv-" + this.getGUID();
        var x = '<div id="' + this._targetdiv  + '" style="display:none;border-width:1px; border-color:black;overflow:hidden;box-shadow: 0px 0px 40px grey;">';
        $("#" + containerid).append(x);
    }

    move(x,y, relative) {
        if (relative) {
            this._dimensions.left += x;
            this._dimensions.top += y;
        }
        else {
            this._dimensions.left = x;
            this._dimensions.top = y;
        }
        this.dirty = true;
        this.refreshPositioning();
    }

    scale(newdims) {
        this._dimensions = newdims;
        this.dirty = true;
    }

    deselectGroup() {
        if (this._groupid != undefined) {
            var items = wbManager.getItems();
            for (var i = 0; i < items.length; i++) {
                if (items[i].getGroup() == this._groupid)
                    items[i].setSelected(false);
            }
        }
    }

    disableInput() {
       
    }

    enableInput() {
    }

    setLocked(truefalse) {
        this._locked = truefalse;
    }
    getLocked() {
        return this._locked;
    }

    duplicate() {
        var newitem = new wbItem();
        this._duplicate(newitem);
        return newitem;
    }

    _duplicate(newitem) {
        newitem.initialize();
        newitem._dimensions = { left: this._dimensions.left, top: this._dimensions.top, width: this._dimensions.width, height: this._dimensions.height }
        newitem._shape = this._shape;
      

        if (this._backgroundColor == undefined)
            newitem._backgroundColor = undefined;
        else
            newitem._backgroundColor = (' ' + this._backgroundColor).slice(1);

        if (this._image != undefined) {
            var newimagedata = (' ' + this._image.src).slice(1);
            var img = new Image();
            img.src = newimagedata;
            newitem._image = img;
        }
        newitem.setupDiv(wbItemHC.container);
        wbManager.addItem(newitem);
    }

    initialize() {
      
    }
    getGUID() {
        return this._guid;
    }

    getType() {
        return this._type;
    }
 
    setBackgroundColor(color) {
        this._backgroundColor = color;
        if (this.getDiv() != undefined) {
            if (color == undefined)
                color = "transparent";
            $("#" + this.getDiv()).css({ "background-color": color });
        }
    }
    

    setGroup(group) {
        this._groupid = group;
    }

    getGroup() {
        return this._groupid;
    }

   

    findConnectedItems() {
        return ([this]);
    }
    getBackgroundColor() {
        return this._backgroundColor;
    }

    getDimensions() {
        return this._dimensions;
    }

    setDimensions(dimensions) {
        this._dimensions = dimensions;
        this.dirty = true;
        this.refreshPositioning();
    }
    findConnectedContainer() {
        var items = wbManager.getItems();
        for (var i = 0; i < items.length; i++) {
            if (items[i].getType() == wbItemType.wbItemContainer) {
                var containedItems = items[i].getContainedItems();
                for (var j = 0; j < containedItems.length; j++) {
                    if (containedItems[j].getGUID() == this.getGUID())
                        return items[i];
                }
            }
        }
        return undefined;
    }

    findGroupItems() {
        var groupitems = [];
        if (this.getGroup() != undefined) {
            var items = wbManager.getItems();
            for (var i = 0; i < items.length; i++) {
                if (items[i].getGroup() == this._groupid)
                    groupitems.push(items[i]);
            }
        }
        return groupitems;
    }

    refreshPositioning() {
 //       if (this._type != wbItemType.wbItemHC) {
            if (this._targetdiv != undefined) {
                var d = wbManager.convertCanvasToWindowCoordinates(this.getDimensions());
                $("#" + this.getDiv()).css({ "width": d.width, "height": d.height, "top": d.top, "left": d.left });
            }
   //     }
    }

    refreshImage(ctx) {
    }

    getSelected() {
        return this._isSelected;
    }

    setSelected(sel) {
        this._isSelected = sel;
    }

    getTempDimensions() {
        return this._tempcanvasimagedimensions;
    }

    storeTempDimensions() {
        this._tempcanvasimagedimensions = { left: this._dimensions.left, top: this._dimensions.top, width: this._dimensions.width, height: this._dimensions.height };
    }

    clearTempDimensions() {
        this._tempcanvasimagedimensions = undefined;
    }

    setShape(shape) {
        this._shape = shape;
        this.dirty = true;
        this.updateCircular();
    }

    updateCircular () {
    if (this.getDiv() != undefined && this.getShape() == wbItemShape.circle)
        $("#" + this.getDiv()).css({ "border-radius": "50%" });
    else
        $("#" + this.getDiv()).css({ "border-radius": "0%" });
    }

    getShape() {
        return this._shape;
    }

    setImage(img) {
        this._image = img;
    }

    getImage() {
        return this._image;
    }

    setDiv(inputdiv) {
        this._targetdiv = inputdiv;
    }

    getDiv() {
        return this._targetdiv;
    }

    setActive(onoff) {
        this._active = onoff;
    }

    getActive() {
          return this._active;       

    }

    activate(ctx) {
        if (this._active == false) {
            this.refreshPositioning();
            this._active = true;

            if (this.getDiv() != undefined) {
                $("#" + this.getDiv()).css({ "display": "block" });       
            }
        }
    }

    deactivate() {
        if (this._active) {         
            this.setActive(false);
            if (this.getDiv() != undefined) {
                $("#" + this.getDiv()).css({ "display": "none" });
            }
        }
    }

    pointInsideItem(pt) {
        var d = this.getDimensions();
        if (pt.x >= d.left && pt.x <= d.left + d.width &&
            pt.y >= d.top && pt.y <= d.top + d.height) {
            return true;
        }
        else
            return false;
    }

    pointInsideItemWithTolerance(pt,tol) {
        var d = this.getDimensions();
        if (pt.x >= d.left-tol && pt.x <= d.left + d.width + tol &&
            pt.y >= d.top-tol && pt.y <= d.top + d.height + tol) {
            return true;
        }
        else
            return false;
    }



    renderPre(ctx, ctx_o) {

        var backgroundColor = this.getBackgroundColor();
        var d = this.getDimensions();
        ctx.fillStyle = backgroundColor;
        ctx.strokeStyle = this.borderColor;
        ctx.shadowColor = '#898';
        ctx.shadowBlur = this.shadowWidth * 2.5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = this.shadowWidth;
        ctx.lineWidth = this.borderWidth;
        if (this.borderPattern != undefined)
            ctx.setLineDash(wbItem.borderPatterns[this.borderPattern]);
        else
            ctx.setLineDash([]);

        ctx.globalAlpha = this.backgroundOpacity;
        if (this.getShape() != wbItemShape.rectangle) {
            ctx.save();
            var d = this.getDimensions();
            if (this.getShape() == wbItemShape.roundedCornerRectangle)
                this.roundRect(ctx, d.left, d.top, d.width, d.height, 50, true, true);
            else {
                ctx.beginPath();
                var radius = Math.sqrt(d.width * d.width + d.height * d.height) / 3;
                if (d.width > d.height)
                    radius = d.height / 2;
                else
                    radius = d.width / 2;
                ctx.arc(d.left + d.width / 2, d.top + d.height / 2, radius, 0, Math.PI * 2, true);
                ctx.stroke();
                ctx.closePath();
            }

            ctx.clip();
        }
    }

    drawPoint(ctx, poi, r) {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.arc(poi.x, poi.y, r, 0.0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }


    renderPost(ctx, ctx_o) {

        var d = this.getDimensions();
        if (this.isLineSnapItem) {
            ctx_o.setLineDash([]);
            ctx_o.fillStyle = "rgb(128,128,255)";
            ctx_o.strokeStyle = "rgb(255,255,255)";
            this.drawPoint(ctx_o, { x: d.left + d.width / 2, y: d.top + d.height / 2 }, 5 / ctx.getTransform().a);
            this.drawPoint(ctx_o, { x: d.left, y: d.top + d.height / 2 }, 5 / ctx.getTransform().a);
            this.drawPoint(ctx_o, { x: d.left + d.width, y: d.top + d.height / 2 }, 5 / ctx.getTransform().a);
            this.drawPoint(ctx_o, { x: d.left + d.width/2, y: d.top }, 5 / ctx.getTransform().a);
            this.drawPoint(ctx_o, { x: d.left + d.width / 2, y: d.top + d.height }, 5 / ctx.getTransform().a);
        }

        if (this.getShape() != wbItemShape.rectangle) 
            ctx.restore();
        if (this.getSelected()) {
            if (this.getLocked())
                ctx_o.strokeStyle = "rgb(255,64,64)";
            else
                ctx_o.strokeStyle = "rgb(64,64,255)";
            ctx_o.lineWidth = 1 / ctx.getTransform().a;
            ctx_o.strokeRect(d.left, d.top, d.width, d.height);
        }

    

        var cd = wbManager.convertCanvasToWindowCoordinates(d);
        if (cd.height > 100) {

            var charwidth = 5 / ctx.getTransform().a;
            var charheight = 11 / ctx.getTransform().a;


            ctx.textAlign = "right";
            ctx.font = 10 / ctx.getTransform().a + "px monospace";
            var top = d.top + charheight;

          
        }
        else {

            var charwidth = 5 / ctx.getTransform().a;
            var charheight = 5 / ctx.getTransform().a;

            var top = d.top + charheight;
           
        }

        ctx.shadowColor = '#898';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalAlpha = 1.0;

    }


    render(ctx, ctx_o) {
        this.renderPre(ctx, ctx_o);

        var backgroundColor = this.getBackgroundColor();
        var d = this.getDimensions();
        if (backgroundColor != undefined && this.backgroundOpacity > 0) {
            ctx.fillRect(d.left, d.top, d.width, d.height);
        }
        if (this.borderWidth > 0 && this.getShape() == wbItemShape.rectangle)
            ctx.strokeRect(d.left + (this.borderWidth - 1)/2, d.top + (this.borderWidth - 1)/2, d.width - (this.borderWidth - 1), d.height - (this.borderWidth - 1));        

        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        var image = this.getImage();
        if (image != undefined)
            ctx.drawImage(image, d.left, d.top, d.width, d.height);

        this.renderPost(ctx, ctx_o);
    }


    roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof stroke === 'undefined') {
            stroke = true;
        }
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        if (typeof radius === 'number') {
            radius = { tl: radius, tr: radius, br: radius, bl: radius };
        } else {
            var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
            for (var side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        if (fill) {
            ctx.fill();
        }
        if (stroke) {
            ctx.stroke();
        }

    }

    connectWindow(whiteboarditem) {
        this._connectedWindows.push({ whiteboarditem: whiteboarditem, position: undefined, type: undefined });
        this.dirty = true;
    }

    getConnectedWindows() {
        return this._connectedWindows;
    }

}
   