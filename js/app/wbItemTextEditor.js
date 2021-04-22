var carotaScale = 1.0;
var carotaOffset = 30;
var carotaSuppressSelection = false;
var carotaItemActive = undefined;
var carotaActive = true;
var skipCarotaLoad = false;

class wbItemTextEditor extends wbItem {
    static resizePhase = 0;
    static startSize = 50;
    
    static contentChanged() {

        if (wbItemTextEditor.skip) {
            wbItemTextEditor.skip = false;
            return;

        }
        if (skipCarotaLoad) {
            skipCarotaLoad = false
            return;
        }     

        /*
        var res = exampleEditor.save();

        if (res.length == 0) {
            setTimeout(function () {
                var range = exampleEditor.selectedRange();
           //     range.setFormatting("align", "center");
            }, 100);

        }
        */
        if (carotaItemActive != undefined && carotaItemActive.autoResizeText == true) {
            if (wbItemTextEditor.resizePhase == 0) {
                wbItemTextEditor.resizePhase = 1;
                exampleEditor.select(0, exampleEditor.frame.length - 1);
                var range = exampleEditor.selectedRange();
                range.setFormatting("size", wbItemTextEditor.startSize.toString());
            }
            else {

                var actualWidth = 0;
                var actualHeight = 0;
                var lines = exampleEditor.frame.lines;
                for (var i = 0; i < lines.length; i++) {
                    if (lines[i].actualWidth > actualWidth)
                        actualWidth = lines[i].actualWidth;
                    if ((lines[i].baseline + lines[i].descent) > actualHeight)
                        actualHeight = (lines[i].baseline + lines[i].descent);
                }

                var dims = carotaItemActive.getDimensions();
                if ((actualWidth > dims.width - 5 || actualHeight > dims.height-10) && wbItemTextEditor.startSize>= 10) {
                    wbItemTextEditor.startSize-=2;
                    //            wbItemTextEditor.skip = true;
                    exampleEditor.select(0, exampleEditor.frame.length - 1);
                    var range = exampleEditor.selectedRange();
                    range.setFormatting("size", wbItemTextEditor.startSize.toString());
                }
                else {
                    wbItemTextEditor.resizePhase = 0;
                    wbItemTextEditor.startSize = 50;
                    exampleEditor.select(0, 0, true)
                }
            }
            return;
        }


        if (carotaItemActive != undefined && carotaItemActive.autoResizeExtents == true) {       
            var actualWidth = 0;
            var actualHeight = 0;
            var lines = exampleEditor.frame.lines;
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].actualWidth > actualWidth)
                    actualWidth = lines[i].actualWidth;
                if ((lines[i].baseline + lines[i].descent) > actualHeight)
                    actualHeight = (lines[i].baseline + lines[i].descent);
            }

            var dims = carotaItemActive.getDimensions();
            dims.width = actualWidth + 30;
            dims.height = actualHeight + 30;
            if (dims.width < 40)
                dims.width = 40;
            if (dims.height < 40)
                dims.height = 40;

            carotaItemActive.setDimensions(dims);
            wbManager.redraw();
        }
    }

    constructor() {
        super();
        this._type = wbItemType.wbItemTextEditor;
        this._editorText;
        this.autoResizeExtents = false;
        this.autoResizeText = false;
        this.setDiv("carotadiv");
        this.textBoxDimensions = { left: 0, top: 0, width: 0, right: 0 };
    }

    setFromJSON(res)
    {
        super.setFromJSON(res);        
        if (res._editorText != undefined)
            this._editorText = res._editorText;
    }



    serialize() {
        var res = super.serialize();        
        res._editorText = this._editorText;
        res.hasImage = false;
        return res;

    }

    scale(newdims) {
        super.scale(newdims);
        this.autoResizeExtents = false;
    }

    refreshPositioning() {
        if (this._targetdiv != undefined) {
            var dims = this.getDimensions();
            this.textBoxDimensions = { "width": dims.width - 20, "height": dims.height - 20, "top": dims.top + 10, "left": dims.left + 10 };
            var d = wbManager.convertCanvasToWindowCoordinates(this.textBoxDimensions);
            $("#" + this.getDiv()).css({ "width": d.width, "height": d.height, "top": d.top, "left": d.left });
            exampleEditor.redraw();
        }
    }



    render(ctx, ctx_o) {
        this.renderPre(ctx, ctx_o);      
        var backgroundColor = this.getBackgroundColor();
        var d = this.getDimensions();
        if (backgroundColor != undefined && this.backgroundOpacity > 0) {
            ctx.fillRect(d.left, d.top, d.width, d.height);
        }
        if (this.borderWidth > 0 && this.getShape() == wbItemShape.rectangle)
            ctx.strokeRect(d.left + (this.borderWidth - 1) / 2, d.top + (this.borderWidth - 1) / 2, d.width - (this.borderWidth - 1), d.height - (this.borderWidth - 1));

        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        var image = this.getImage();
        if (image != undefined)
            ctx.drawImage(image, this.textBoxDimensions.left, this.textBoxDimensions.top, this.textBoxDimensions.width, this.textBoxDimensions.height);

        this.renderPost(ctx, ctx_o);
    }


    refreshImage(ctx) {
        var savactive = this._active;
        this.activate(ctx);
        this._active = savactive;
        if (this._active == false) {
            carotaSuppressSelection = true;
            exampleEditor.redraw();
            var ca = $("#" + this.getDiv()).find("canvas");
            var durl = ca[0].toDataURL()
            var img = new Image();
            img.src = durl;
            this.setImage(img);
            carotaSuppressSelection = false;
            var _this = this;
            setTimeout(function () {
                $("#" + _this.getDiv()).css({ "display": "none" });
                wbManager.redraw();
            }, 10);
        }
    }

    async duplicate() {
        await this.deactivate();
        var newitem = new wbItemTextEditor();
        super._duplicate(newitem);
        newitem.setDiv("carotadiv");
        newitem._editorText = (' ' + this._editorText).slice(1);
        return newitem;
    }

    setBackgroundColor(color) {
        this._backgroundColor = color;
    }


    activate(ctx) {
        var tempactive = this._active;
        super.activate(ctx);
        if (tempactive == false) {
            carotaActive = true;
            this.setBackgroundColor(this.getBackgroundColor());
            carotaItemActive = this;
            carotaScale = ctx.getTransform().a;
            this._image = undefined;
            var _this = this;
          
                skipCarotaLoad = true;
                if (_this._editorText != undefined) {
                    var ca = JSON.parse(_this._editorText);
                    //                    for (var i = 0; i < ca.length; i++) {
                    //                      ca[i].size = 30 * ctx.getTransform().a;
                    //                }
                    exampleEditor.load(ca);
                    var range = exampleEditor.selectedRange();
                    range.setFormatting("align", "center");
            //        exampleEditor.setVerticalAlignment("middle");
                }
                else {
                    var ca = [];
                    ca.push({ text: '', size: 10, align: "center"});
                    exampleEditor.load(ca);
                    exampleEditor.select(0, exampleEditor.frame.length - 1);
                    var dims = this.getDimensions();
                    var range = exampleEditor.selectedRange();
                    range.setFormatting("size", (dims.height/2).toString());
                    range.setFormatting("align", "center");
          //          exampleEditor.setVerticalAlignment("middle");
                }         

        }
    }

    deactivate() {
        var tempactive = this._active;
       
        if (tempactive) {
            carotaActive = false;
            this.setDirty();
            carotaItemActive = undefined;
            this._editorText = JSON.stringify(exampleEditor.save());

            carotaSuppressSelection = true;
            exampleEditor.redraw();
            var ca = $("#" + this.getDiv()).find("canvas");
            var durl = ca[0].toDataURL()
            var img = new Image();
            img.src = durl;
            this.setImage(img);
            carotaSuppressSelection = false;
            setTimeout(function () {
                wbManager.redraw();
            }, 10);

        }
        super.deactivate();
    }
}
