const wbOperatorScaleHandlePosition = {
    topLeft: 0,
    topRight: 1,
    bottomRight: 2,
    bottomLeft: 3,
    drag: 4
};

const handleTypes = {
    scaleItem: 0,
    dragItem: 1,
    dragLinePoint:2

}




function handleInfo(handleType) {
    this.type = handleType;
    this.extra = undefined;
}



class wbOperator  {

    constructor(ctx,ctx_o) {       
        this._whiteboarditem = window;
        this._button;
        this.drawSelectionRectangle;
        this._itemUnderMouse;
        this._ctx = ctx;
        this._ctx_o = ctx_o;
        this._dragged;
        this.dragStart
        this.dragLast
        this._dragged;
        this._pickedHandle;
        this._lastmouseuptime;
        this.cachedSelectedItems = [];
        this.cachedLineItems = [];
        this._cameraDirty = false;
    }

    setCameraDirty()
    {
        this._cameraDirty = true;
    }

    getCameraDirty()
    {
        return this._cameraDirty;
    }

    clearCameraDirty()
    {
        this._cameraDirty = false;
    }


    _disableEnableInput(onoff) {
        var whiteboardItems = wbManager.getItems();
        for (var i = 0; i < whiteboardItems.length; i++) {
            if (onoff == true)
                whiteboardItems[i].enableInput();
            else
                whiteboardItems[i].disableInput();

        }
    }



    _startSelectionDrag(itemUnderMouse) {
        var whiteboardItems = wbManager.getItems();
        for (var i = 0; i < whiteboardItems.length; i++) {
            whiteboardItems[i].clearTempDimensions();
        }

        for (var i = 0; i < whiteboardItems.length; i++) {
            if (whiteboardItems[i].getSelected() || i == itemUnderMouse) {
                whiteboardItems[i].storeTempDimensions();              

            }
        }
    }

    _selectionDrag() {
        var pt = this._ctx.transformedPoint(lastX, lastY);

        var whiteboardItems = wbManager.getItems();
        for (var i = 0; i < whiteboardItems.length; i++) {
        
            if (whiteboardItems[i].getTempDimensions() != undefined && !whiteboardItems[i].getLocked()) {
                var d = whiteboardItems[i].getDimensions();
                var t = whiteboardItems[i].getTempDimensions();
//                whiteboardItems[i].move(pt.x - this.dragLast.x, pt.y - this.dragLast.y, true);
                whiteboardItems[i].move(t.left + (pt.x - this.dragStart.x), t.top + (pt.y - this.dragStart.y), false);


            }
        }
     
    }

    _selectionScale() {
        var boundinginfo = wbManager.calculateSelectionBounding(true);
        if (boundinginfo != undefined) {
            var b = boundinginfo.bounding;
            var boundingHeight, boundingWidth;
            var pt = this._ctx.transformedPoint(lastX, lastY);
          
            if (this._pickedHandle.extra == wbOperatorScaleHandlePosition.topLeft) {
                boundingWidth = (b.x2 - b.x1) - (pt.x - this.dragStart.x);
                if (boundinginfo.keepAspectRatio)
                    boundingHeight = (b.y2 - b.y1) / (b.x2 - b.x1) * boundingWidth;
                else
                    boundingHeight = (b.y2 - b.y1) - (pt.y - this.dragStart.y);
            }
            else if (this._pickedHandle.extra == wbOperatorScaleHandlePosition.bottomRight) {
                boundingWidth = (b.x2 - b.x1) + (pt.x - this.dragStart.x);
                if (boundinginfo.keepAspectRatio)
                    boundingHeight = (b.y2 - b.y1) / (b.x2 - b.x1) * boundingWidth;
                else
                    boundingHeight = (b.y2 - b.y1) + (pt.y - this.dragStart.y);
            }
            else if (this._pickedHandle.extra == wbOperatorScaleHandlePosition.topRight) {
                boundingWidth = (b.x2 - b.x1) + (pt.x - this.dragStart.x);
                if (boundinginfo.keepAspectRatio)
                    boundingHeight = (b.y2 - b.y1) / (b.x2 - b.x1) * boundingWidth;
                else
                    boundingHeight = (b.y2 - b.y1) - (pt.y - this.dragStart.y);
            }
            else if (this._pickedHandle.extra == wbOperatorScaleHandlePosition.bottomLeft) {
                boundingWidth = (b.x2 - b.x1) - (pt.x - this.dragStart.x);
                if (boundinginfo.keepAspectRatio)
                    boundingHeight = (b.y2 - b.y1) / (b.x2 - b.x1) * boundingWidth;
                else
                    boundingHeight = (b.y2 - b.y1) + (pt.y - this.dragStart.y);
            }

            var boundingWidthFactor = boundingWidth / (b.x2 - b.x1)
            var boundingHeightFactor = boundingHeight / (b.y2 - b.y1)

            var whiteboardItems = wbManager.getItems();
            for (var i = 0; i < whiteboardItems.length; i++) {
                if (whiteboardItems[i].getSelected() && !whiteboardItems[i].getLocked()) {
                    var d = {left:0, top:0, width:0, height:0}
                    var t = whiteboardItems[i].getTempDimensions();
                    var ttt = d.width;
                    d.width = t.width * boundingWidthFactor;
                    var f = d.width / ttt;
                    d.height = t.height * boundingHeightFactor;
                    if (this._pickedHandle.extra == wbOperatorScaleHandlePosition.topLeft) {
                        d.left = b.x2 + (t.left - b.x2) * boundingWidthFactor;
                        d.top = b.y2 + (t.top - b.y2) * boundingHeightFactor;
                    }
                    else if (this._pickedHandle.extra == wbOperatorScaleHandlePosition.bottomRight) {
                        d.left = b.x1 + (t.left - b.x1) * boundingWidthFactor;
                        d.top = b.y1 + (t.top - b.y1) * boundingHeightFactor;
                    }
                    else if (this._pickedHandle.extra == wbOperatorScaleHandlePosition.topRight) {
                        d.left = b.x1 + (t.left - b.x1) * boundingWidthFactor;
                        d.top = b.y2 + (t.top - b.y2) * boundingHeightFactor;
                    }
                    else if (this._pickedHandle.extra == wbOperatorScaleHandlePosition.bottomLeft) {
                        d.left = b.x2 + (t.left - b.x2) * boundingWidthFactor;
                        d.top = b.y1 + (t.top - b.y1) * boundingHeightFactor;
                    }

                    whiteboardItems[i].scale(d);

                    if (whiteboardItems[i].getType() == wbItemType.wbItemHC) {
                        var connectedWindows = whiteboardItems[i].getConnectedWindows();

                        for (var j = 0; j < connectedWindows.length; j++) {
                            if (connectedWindows[j].position != undefined) {
                                connectedWindows[j].position.left *= f;
                                connectedWindows[j].position.top *= f;
                                connectedWindows[j].position.radius *= f;
                            }
                        }
                    }                                       
                    whiteboardItems[i].refreshPositioning();
                }
            }
        }
    }

    _pickHandle(pt) {
        var st = 15 / this._ctx.getTransform().a;
        var boundinginfo = wbManager.calculateSelectionBounding(false);
        if (boundinginfo != undefined) {
            var found = true;
            var myHandleInfo = new handleInfo(handleTypes.scaleItem);
            var b = boundinginfo.bounding;
            var mx = (b.x2 + b.x1) / 2;
            if (pt.x >= b.x1 - st && pt.x <= b.x1 + st && pt.y >= b.y1 - st && pt.y <= b.y1 + st) {
                myHandleInfo.extra = wbOperatorScaleHandlePosition.topLeft;
            }
            else if (pt.x >= b.x2 - st && pt.x <= b.x2 + st && pt.y >= b.y2 - st && pt.y <= b.y2 + st) {
                myHandleInfo.extra = wbOperatorScaleHandlePosition.bottomRight;
            }
            else if (pt.x >= b.x2 - st && pt.x <= b.x2 + st && pt.y >= b.y1 - st && pt.y <= b.y1 + st) {
                myHandleInfo.extra = wbOperatorScaleHandlePosition.topRight;
            }
            else if (pt.x >= b.x1 - st && pt.x <= b.x1 + st && pt.y >= b.y2 - st && pt.y <= b.y2 + st) {
                myHandleInfo.extra = wbOperatorScaleHandlePosition.bottomLeft;
            }
            else if (pt.x >= mx - st && pt.x <= mx + st && pt.y >= b.y1 - st && pt.y <= b.y1 + st) {
                myHandleInfo.type = handleTypes.dragItem;
            }
            else
                found = false;
            if (found)
                return myHandleInfo;
        }
        return (wbLine.checkAndStartLinePointSelection(pt));
    }
 
    onMouseDown(evt_x, evt_y, evt_button) {       

        if (cmOpen)
            return;
        menuManager.hideAll();
       
        blockRightClick = false;
        this._button = evt_button;
        this.drawSelectionRectangle = false;
        this._itemUnderMouse = undefined;
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt_x;
        lastY = evt_y;
        this.dragStart = this._ctx.transformedPoint(lastX, lastY);
        this.dragLast = this._ctx.transformedPoint(lastX, lastY);
        this._dragged = false;
        this._pickedHandle = undefined;
        if (wbManager.getRectangleLoadData() != undefined)
            return;

        this._itemUnderMouse = wbManager.findwbItemUnderMouse();
        if (this._itemUnderMouse != undefined && this._itemUnderMouse.getLocked() == true)
            this._itemUnderMouse = undefined;

        if (this._button == 0) {
            this._pickedHandle = wbLine.checkAndStartNewLine(this.dragStart, this._itemUnderMouse);
            if (this._pickedHandle == undefined)
                this._pickedHandle = this._pickHandle(this.dragStart);
            if (this._pickedHandle == undefined) {

                if (this._itemUnderMouse != undefined && this._itemUnderMouse.getType() == wbItemType.wbItemModelTree) {
                    if (this._itemUnderMouse.onMouseDown())
                        return;
                }
                if (this._itemUnderMouse == undefined) {
                    wbManager.clearSelection();                 

                }
                else {
                    if (this._itemUnderMouse.getSelected() == true && ctrlPressed && this._itemUnderMouse.getActive() == false) {
                        this._itemUnderMouse.setSelected(false);
                        this._itemUnderMouse.deselectGroup();
                    }
                    else {

                        if (this._itemUnderMouse.getSelected() == false) {
                            if (!ctrlPressed)
                                wbManager.clearSelection();
                            this._itemUnderMouse.setSelected(true);
                            wbManager.selectRelatedGroups();
                            menuManager.hideSelectionMenu();
                        }
                    }
                    this._startSelectionDrag();
                }

            }
            else if (this._pickedHandle.type == handleTypes.dragItem) {
                this._disableEnableInput(false);
                this._startSelectionDrag();
            }
            else if (this._pickedHandle.type == handleTypes.dragLinePoint) {
                ;
            }
            else {
                this._disableEnableInput(false);
                this._startSelectionDrag();
            }
        }
        this.cachedSelectedItems = wbManager.getSelectedItems();
        this.cachedLineItems = wbManager.getLineItems();
    }


    onMouseMove(evt_x, evt_y, evt_button) {
        if (cmOpen)
            return;
        lastX = evt_x;
        lastY = evt_y;

        this._dragged = true;
        var pt = this._ctx.transformedPoint(lastX, lastY);

        if (this.dragStart) {
            if (this._button == 2) {
                blockRightClick = true;
                if (this._itemUnderMouse == undefined) {
                    menuManager.hideSelectionMenu();                  
                    this._ctx.translate(pt.x - this.dragStart.x, pt.y - this.dragStart.y);
                    this._ctx_o.translate(pt.x - this.dragStart.x, pt.y - this.dragStart.y);
                    this.setCameraDirty();
                    wbManager.redraw();
                    wbManager.respositionNonCanvasItems();
                }
            }
            else {
                if (this._itemUnderMouse != undefined && this._itemUnderMouse.getType() == wbItemType.wbItemModelTree) {
                    if (this._itemUnderMouse.onMouseMove())
                        return;
                }
                if (this._itemUnderMouse != undefined && this._itemUnderMouse.getActive() && this._pickedHandle == undefined)
                    return;
                

                menuManager.hideSelectionMenu();
                if (!wbLine.dragLinePointSelection(pt, this._pickedHandle)) {

                    if ((this._itemUnderMouse != undefined || this._pickedHandle != undefined) && this.drawSelectionRectangle == false) {
                        if (this._pickedHandle == undefined || this._pickedHandle.type == handleTypes.dragItem) {
                            this._selectionDrag();
                            wbManagerAlignment.calculateAlignment(false);
                        }
                        else {
                            this._selectionScale();
                            wbManagerAlignment.calculateAlignment(true);
                        }


                        if (this._pickedHandle != undefined && this._pickedHandle.type != handleTypes.dragItem) {
                            var whiteboardItems = wbManager.getItems();
                            for (var i = 0; i < whiteboardItems.length; i++) {
                                if (whiteboardItems[i].getType() == wbItemType.wbItemTextEditor) {
                                    if (whiteboardItems[i].getActive())
                                        whiteboardItems[i].deactivate();
                                    else if (whiteboardItems[i].getTempDimensions() != undefined)
                                        whiteboardItems[i].refreshImage(this._ctx);
                                }
                            }


                        }
                        wbManager.respositionNonCanvasItems();
                        wbLine.updateAllSnappedLinePoints();
                        wbManager.redraw();
                        wbManagerAlignment.drawAlignment();
                    }
                    else {
                        if (wbManager.getRectangleLoadData()==undefined) {
                            this.drawSelectionRectangle = true;
                        }
                            wbManager.redraw();

                    }
                }
            }
        }
        this.dragLast = this._ctx.transformedPoint(lastX, lastY);

    }




    onMouseUp(evt_x, evt_y, evt_button) {
        if (cmOpen)
            return;
        this._disableEnableInput(true);

        var mouseuptime = new Date();
        var pt = this._ctx.transformedPoint(lastX, lastY);

        if (this._itemUnderMouse != undefined && this._itemUnderMouse.getType() == wbItemType.wbItemModelTree)
            this._itemUnderMouse.onMouseUp(this._dragged);

        if (mouseuptime - this._lastmouseuptime < 200 && this._button == 0 && !this._dragged) {
            if (this._itemUnderMouse == undefined) {
                wbManager.deactivateAll(true);                
                wbLine.deletePointFromDoubleClick(pt);
            }
            else {
                if (!wbLine.deletePointFromDoubleClick(pt)) {
                    if (this._itemUnderMouse.getActive() == false) {
                        this._dragged = false;
                        this.dragStart = undefined;
                        wbManager.deactivateAll(!wbItemHC.keepAlive).then(function () {
                            wbManager.activateItemUnderMouse();
                        });
                    }
                }
            }
        }
        else {
            if (this._button == 0 && !this._dragged && this._itemUnderMouse == undefined)
                wbManager.deactivateAll(!wbItemHC.keepAlive);
        }

        this._lastmouseuptime = mouseuptime;

        if (this.drawSelectionRectangle == true) {
            wbManager.selectFromRectangle(this.dragStart);
            this.drawSelectionRectangle = false;
            wbManager.redraw();
        }
        if (wbManager.getRectangleLoadData() != undefined) {
            wbManager.loadFromLoadData();
        }
        this.dragStart = undefined;

        menuManager.showSelectionMenu();
        this.cachedSelectedItems = wbManager.getSelectedItems();
        this.cachedLineItems = wbManager.getLineItems();
        wbLine.finalizePointDrag(this._pickedHandle);
        wbLine.updateAllSnappedLinePoints();
        wbLine.updateAllLineData();
        if (wbLine.lineSnapItem) {
            wbLine.lineSnapItem.isLineSnapItem = false;
            wbLine.lineSnapItem = undefined;
        }

        wbManager.redraw();
    }

    onMouseWheel(evt) {
        menuManager.hideSelectionMenu();
        setTimeout(function () {
            menuManager.showSelectionMenu();
        }, 100);

        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta) wbManager.zoom(delta);
        wbManager.respositionNonCanvasItems();
        this.setCameraDirty();
        return evt.preventDefault() && false;
    }

   

    onTouchStart(event) { }
    onTouchMove(event) { }
    onTouchEnd(event) { }
    onKeyDown(event) { }
    onKeyUp(event) { }
    onDeactivate() { }
    onActivate() { }
    onViewOrientationChange() { }
    stopInteraction() { }
}