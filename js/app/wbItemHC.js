const connectedWindowType = {
    magnifier: 0,
    floorplan: 1,
    floorplan3D: 1,
};

class wbItemHC extends wbItem {

    static keepAlive = false;
    static activeHCItem;
    static container = "newdialogwindow";
    static minFramerate = 10;

    static setDrawMode(drawMode) {
        var activeViewer = wbManager.findwbItemHCUnderMouse();
        var hwv = activeViewer.getHWV();
        hwv.view.setDrawMode(drawMode);
    }
    static setViewOrientation(orientation) {
        var activeViewer = wbManager.findwbItemHCUnderMouse();
        var hwv = activeViewer.getHWV();
        hwv.view.setViewOrientation(orientation);
    }
    static setAmbientOcclusion(onoff) {
        var activeViewer = wbManager.findwbItemHCUnderMouse();
        var hwv = activeViewer.getHWV();
        hwv.view.setAmbientOcclusionEnabled(onoff);
    }
    static setBloom(onoff) {
        var activeViewer = wbManager.findwbItemHCUnderMouse();
        var hwv = activeViewer.getHWV();
        hwv.view.setBloomEnabled(onoff);
    }

    static setProjectionMode(projMode) {
        var activeViewer = wbManager.findwbItemHCUnderMouse();
        var hwv = activeViewer.getHWV();
        hwv.view.setProjectionMode(projMode);
    }

    static setKeepAlive(onoff) {
        wbItemHC.keepAlive = onoff;
    }

    static create(modelname,size) {
        wbManager.clearSelection()
        
        if (wbItemHC.activeHCItem != undefined && wbItemHC.keepAlive == false) {
            wbItemHC.activeHCItem.deactivate().then(function () {
                wbItemHC._create(modelname,size);
            });
        }
        else
            wbItemHC._create(modelname,size);

    }


    static async _replace(modelname, item) {

        await item.shutdown();
        item.setModelName(modelname);
        await item.activate();    
    }

    static async replace(modelname, item) {

        if (wbItemHC.activeHCItem != undefined && wbItemHC.keepAlive == false) {
            await wbItemHC.activeHCItem.deactivate();
            await wbItemHC._replace(modelname, item);
        }
        else
            await wbItemHC._replace(modelname, item);

    }

    static _create(modelname,size) {

        var item = wbManager.findwbItemHCUnderMouse();
        if (item != undefined &&  modelname != undefined && size==undefined) {
            item.shutdown().then(function () {
                item.setModelName(modelname);
                item.activate();
            });
            return item;
        }
        else {

            var whiteboarditem = new wbItemHC();
            whiteboarditem.initialize(modelname);
            whiteboarditem.setupDiv(wbItemHC.container);
            wbManager.addItem(whiteboarditem);

            var canvasdimensions;
            if (size != undefined) {
                canvasdimensions = {
                    left: size.left, top: size.top, width: size.width, height: size.height
                }
            }
            else {
                var newdims = {
                    left: lastX, top: lastY,
                    width: 500, height: 500
                };
                canvasdimensions = wbManager.convertWindowToCanvasCoordinates(newdims);
            }
            whiteboarditem.setDimensions(canvasdimensions);

            whiteboarditem.activate();
            wbItemHC.activeHCItem = whiteboarditem;
            wbManager.redraw();
            return whiteboarditem;
        }
    }

    constructor() {
        super();
        this._modelName = ""
        this._hcmodel;
        this._type = wbItemType.wbItemHC;
        this._currentState = new hcModelState();
        this._savedoperator = 1;
        this._inputDisabled = false;
    }
    initialize(modelname) {
        super.initialize();
        this.setModelName(modelname);
    }




    setModelName(modelname) {
        this._modelName = modelname;      
    }


    getModelName() {
        return this._modelName;
    }

    getHCModel() {
        return this._hcmodel;
    }

    setHCModel(hcmodel) {
        this._hcmodel = hcmodel;
    }

    getModelState() {
        return this._currentState;
    }

    render(ctx, ctx_o) {

        this.renderPre(ctx, ctx_o);

        var image = this.getImage();
        var d = this.getDimensions();     
        var backgroundColor = this.getBackgroundColor();
        if (backgroundColor != undefined && this.backgroundOpacity > 0) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(d.left, d.top, d.width, d.height);
        }
        if (this.borderWidth > 0 && this.getShape() == wbItemShape.rectangle)
            ctx.strokeRect(d.left + (this.borderWidth - 1) / 2, d.top + (this.borderWidth - 1) / 2, d.width - (this.borderWidth - 1), d.height - (this.borderWidth - 1));
        
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        if (image != undefined) {
            /*

            var aspectRatio = d.width / d.height;
            var war = d.width * this._oldar;
            var har = d.height / this._oldar;
            if (d.width > d.height)
                ctx.drawImage(image, d.left + d.width / 2 - war / aspectRatio / 2, d.top, war / aspectRatio, d.height);
            else
                ctx.drawImage(image, d.left, d.top + d.height / 2 - har *aspectRatio / 2, d.width, har * aspectRatio);

            */
            ctx.drawImage(image, d.left, d.top, d.width, d.height);



        }
        var connectedWindows = this.getConnectedWindows();

        var ctx_mag;
        if (wbItemHC.activeHCItem == undefined)
            ctx_mag = ctx;
        else
            ctx_mag = ctx_o;
        for (var j = 0; j < connectedWindows.length; j++) {

            var mb = connectedWindows[j].position;
            if (mb != undefined) {
                ctx_mag.lineWidth = 1.5 / ctx.getTransform().a;
                ctx_mag.strokeStyle = "rgb(200,200,0)";
                ctx_mag.beginPath();
                ctx_mag.arc(d.left + mb.left, d.top + mb.top, mb.radius, 0, 2 * Math.PI);
                ctx_mag.stroke();


                var item = connectedWindows[j].whiteboarditem;
                var dims = item.getDimensions();

                var c1 = new Communicator.Point2(d.left + mb.left, d.top + mb.top);
                var c2 = new Communicator.Point2(dims.left + dims.width / 2, dims.top + dims.height / 2);
                var r1 = mb.radius;
                var r2 = dims.width / 2;
                var dist = Communicator.Point2.distance(c2, c1);
                var dir = Communicator.Point2.subtract(c2, c1);
                dir.x /= dist;
                dir.y /= dist;

                var p1 = dir.copy().scale(r1);
                var p2 = dir.copy().scale(r2);

                ctx_mag.beginPath();
                ctx_mag.moveTo(c1.x - p1.y, c1.y + p1.x);
                ctx_mag.lineTo(c2.x - p2.y, c2.y + p2.x);
                ctx_mag.stroke();
                ctx_mag.beginPath();
                ctx_mag.moveTo(c1.x + p1.y, c1.y - p1.x);
                ctx_mag.lineTo(c2.x + p2.y, c2.y - p2.x);
                ctx_mag.stroke();
            }

        }

        this.renderPost(ctx, ctx_o);
    }

    getHWV() {
        if (this.getHCModel() != undefined)
            return this.getHCModel().getHWV();
    }

  

    refreshPositioning() {
        super.refreshPositioning();
        if (this.getActive() == true && this.getHWV() != undefined)
            this.getHWV().resizeCanvas();
    }

    _setupDialog() {


        this.updateCircular();
        var color = this.getBackgroundColor();
        if (color == undefined)
            color = "transparent";

        var d = wbManager.convertCanvasToWindowCoordinates(this.getDimensions());
        if (this.getImage() != undefined) {
            this.getImage().width = d.width;
            this.getImage().height = d.height;
            $("#" + this.getDiv()).append(this.getImage());
            var _this = this;
            setTimeout(function () {
                $("#" + _this.getDiv()).find("img").remove();
            }, 500);
        }
        $("#" + this.getDiv()).css({ "background-color": color, "display": "block", "width": d.width, "height": d.height, "top": d.top, "left": d.left, "position": "absolute" });
    }

    _generateImage() {
        var _this = this;
        var lst = new Promise(function (resolve, reject) {
            var divname = _this.getDiv();
            var canvas = $("#" + divname).find("canvas")[0]
            var cx = canvas.width;
            var cy = canvas.height;
            var oldcx =  $("#" + divname).width();
            var oldcy =  $("#" + divname).height()
            if (canvas.width < 200) {
                cx = canvas.width / (canvas.width / 500);
                cy = canvas.height / (canvas.width / 500);
            }
            _this.getHCModel().getHWV().setMinimumFramerate(0);
            var config = new Communicator.SnapshotConfig(cx, cy);
            _this.getHCModel().getHWV().view.getAxisTriad().disable();
            _this.getHCModel().getHWV().view.getAxisTriad().disable();
            _this.getHCModel().getHWV().view.getNavCube().disable();
            
            if (_this.getModelState().measureData == "[]") {
                var oldtop = $("#" + _this.getDiv()).css("top");
                $("#" + _this.getDiv()).css({ "width": cx, "height": cy,"top":-1000});
                _this.getHCModel().getHWV().resizeCanvas();
                _this.getHCModel().getHWV().redraw(function () {
                    var img = new Image();
                    img.src = canvas.toDataURL({type:"image/jpeg"});
                    $("#" + _this.getDiv()).css({ "width": oldcx + "px", "height": oldcy + "px", "top":oldtop });
                    _this.getHCModel().getHWV().resizeCanvas();
                    resolve(img);
                });
            }
            else {
                _this.getHCModel().getHWV().takeSnapshot(config).then(function (image) {
                    resolve(image);
                });
            }
        });
        return lst;
    }


    activate() {
        var _this = this;
        var lst = new Promise(function (resolve, reject) {

            if (_this.getActive() != true) {
                if (_this.getModelName() != undefined) {

                    wbItemHC.activeHCItem = _this;

                    _this._setupDialog();                    
                    _this.setActive(true);
                    _this.setImage(undefined);

                    wbManager.redraw();

                    _this.setHCModel(hcModelCache.getModel(_this.getModelName(), _this.getGUID()));
                    _this.getHCModel().activateHWV(_this.getDiv(), _this, function () {
                        var modelstate = _this.getModelState();
                        modelstate.activate(_this.getHWV()).then(function () {                            
                            resolve();
                        });
                    });
                }
                else {
                    resolve();
                }
            }
            else
                    resolve();
                
        });
        return lst;
    }

    async duplicate() {
        var _this = this;
        await this.deactivate();
        var newitem = new wbItemHC();
        super._duplicate(newitem);
        newitem._currentState = _this._currentState.duplicate();
        newitem._modelName = (' ' + _this._modelName).slice(1);
        return newitem;
    }

  
    shutdown() {
        var _this = this;
        var lst = new Promise(function (resolve, reject) {
            _this.deactivate().then(function () {
                _this._currentState = new hcModelState();
                _this._connectedWindows = [];
                _this.setImage();
                resolve();
            });
        });
        return lst;
    }

    deactivate() {
        var _this = this;
        var lst = new Promise(function (resolve, reject) {
            if (_this.getActive() != false) {
                _this.setActive(false);
                _this.getModelState().saveStatesFromHWV(_this.getHWV());
                _this.setDirty();
                _this._generateImage().then(function (image) {
                    _this.setImage(image);
                    _this.imageDirty = true;
                    _this.getHCModel().deactivateHWV();
                    var divnameimage = "wdiv-" + _this.getGUID() + "image";
                    var divname = _this.getDiv();
                    var x = '<div id="' + divnameimage + '"></div>'
                    $("#" + divname).empty();
                    $("#" + _this.getDiv()).css({ "display": "none" });
                    wbManager.redraw();
                    resolve()
                });
            }
            else
                resolve();
        });
        return lst;
    }

    setupFromState(setupwindow, dimensions, newmodelstate) {
        var _this = this;
        var lst = new Promise(function (resolve, reject) {
            var oldcamera = setupwindow.getHWV().view.getCamera().copy();
            setupwindow.getModelState().saveStatesFromHWV(setupwindow.getHWV());
            setupwindow.getHWV().measureManager.removeAllMeasurements();
            newmodelstate.apply(setupwindow.getHWV()).then(function () {
                var newcamera = setupwindow.getHWV().view.getCamera().copy();
                setupwindow._generateImage().then(function (image) {
                    setupwindow.getHWV().reset(0).then(function () {
                        $("#" + _this.getDiv()).css({ "display": "none" });
                        if (setupwindow.getModelState().measureData != undefined) {
                            setupwindow.getHWV().measureManager.loadData(JSON.parse(setupwindow.getModelState().measureData));
                        }
                        setupwindow.getHWV().view.setCamera(oldcamera, 0);
                        setupwindow.getHWV().explodeManager.setMagnitude(0);
                        _this.setImage(image);
                        _this.imageDirty = true;
                        _this.setDirty();
                        _this.setDimensions(dimensions);
                        _this.getModelState().saveCamera(newcamera);
                        newmodelstate.drawMode = setupwindow.getHWV().view.getDrawMode();
                        newmodelstate.ambientOcclusion = setupwindow.getHWV().view.getAmbientOcclusionEnabled();
                        newmodelstate.bloom = setupwindow.getHWV().view.getBloomEnabled();
                        newmodelstate.projectionMode = setupwindow.getHWV().view.getProjectionMode();
                        _this.getModelState().copy(newmodelstate);
                        wbManager.redraw();
                        _this.setActive(false);
                        resolve()
                    });
                });
            });
        });
        return lst;

    }

    _newViewerFromCurrent(modelname, location, viewerstate) {
        var _this = this;

        var lst = new Promise(function (resolve, reject) {

            var whiteboarditem = new wbItemHC();
            whiteboarditem.initialize(modelname);
            whiteboarditem.setupDiv(wbItemHC.container);
            wbManager.addItem(whiteboarditem);
            whiteboarditem.setupFromState(_this, location, viewerstate).then(function () {
                resolve(whiteboarditem);
            });
        });
        return lst;
    }

    async isolateToNewWindow() {
        await this.activate();

        var hwv = this.getHWV();
        hwv.setMinimumFramerate(0);
        var selid = hwv.selectionManager.getLast().getNodeId();
        var sels = [];
        var r = hwv.selectionManager.getResults();
        for (var i = 0; i < r.length; i++)
            sels.push(r[i].getNodeId());
        hwv.selectionManager.clear();

        var olddims = this.getDimensions()
        var totalwidth = olddims.width / 2 * 1.2 * (sels.length);

        for (var i = 0; i < sels.length; i++) {
            var newdims = {
                left: (olddims.left + olddims.width/2) - totalwidth/2 + (olddims.width / 2 * 1.2) * i, top: olddims.top + olddims.height * 1.2,
                width: olddims.width / 2, height: olddims.height / 2
            };
            var viewerstate = new hcModelState();
            viewerstate.isolateNode = sels[i];

            await this._newViewerFromCurrent(this.getModelName(), newdims, viewerstate);
        }
        hwv.setMinimumFramerate(10);

    }

    async uniqueMeshesToNewWindow() {
        await this.activate();

        var hwv = this.getHWV();
        hwv.setMinimumFramerate(0);

        var hv = this.getHCModel();
        var uniquemeshids = await hv.findUniqueMeshes();

        var sels = [];
        for (var i in uniquemeshids)
            sels.push(uniquemeshids[i]);

        var olddims = this.getDimensions()
        var totalwidth = olddims.width / 2 * 1.2 * (sels.length);

        if (sels.length > 1000)
            alert("Too many unique parts");
        else {

            for (var i = 0; i < sels.length; i++) {
                var newdims = {
                    left: (olddims.left + olddims.width / 2) - totalwidth / 2 + (olddims.width / 2 * 1.2) * i, top: olddims.top + olddims.height * 1.2,
                    width: olddims.width / 2, height: olddims.height / 2
                };
                var viewerstate = new hcModelState();
                viewerstate.isolateNode = sels[i];
                await this._newViewerFromCurrent(this.getModelName(), newdims, viewerstate);
            }
        }
        hwv.setMinimumFramerate(10);

    }

    async duplicateToNewWindow() {
        await this.activate();

        var hwv = this.getHWV();
        hwv.setMinimumFramerate(0);

        var olddims = this.getDimensions()
        var newdims = {
            left: olddims.left + olddims.width + olddims.width / 3, top: olddims.top,
            width: olddims.width, height: olddims.height
        };
        var viewerstate = new hcModelState();
        viewerstate.camera = this.getHWV().getView().getCamera().copy();

        this._newViewerFromCurrent(this.getModelName(), newdims, viewerstate);
        hwv.setMinimumFramerate(10);

    }

    async isolateAllToNewWindow() {
        await this.activate();

        var hwv = this.getHWV();
        hwv.setMinimumFramerate(0);
        var selid = hwv.selectionManager.getLast().getNodeId();
        var sels = [];
        var r = hwv.selectionManager.getResults();
        for (var i = 0; i < r.length; i++)
            sels.push(r[i].getNodeId());
        hwv.selectionManager.clear();

        var olddims = this.getDimensions()
        var newdims = {
            left: olddims.left + olddims.width + olddims.width / 3, top: olddims.top,
            width: olddims.width, height: olddims.height
        };

        var viewerstate = new hcModelState();
        viewerstate.isolateNode = sels;
        this._newViewerFromCurrent(this.getModelName(), newdims, viewerstate);
        hwv.setMinimumFramerate(10);

    }



    disableInput() {
        var hwv = this.getHWV();
        if (hwv != undefined && this._inputDisabled == false) {
            this._inputDisabled = true;
            if (hwv.operatorManager._operatorStack[0] != 0)
                this._savedoperator = hwv.operatorManager._operatorStack[0]
            hwv.operatorManager.set(Communicator.OperatorId.None, 0);
            hwv.operatorManager.set(Communicator.OperatorId.Turntable, 1);
        }

    }

    enableInput() {
        var hwv = this.getHWV();
        if (hwv != undefined && this._inputDisabled == true) {
            hwv.operatorManager.set(this._savedoperator, 0);
            hwv.operatorManager.set(Communicator.OperatorId.Select, 1);
            this._inputDisabled = false;
        }
    }

    setSelected(sel) {
        super.setSelected(sel);
        if (sel == false)
            this.disableInput();
        else
            this.enableInput();
    }


    async magnifierToNewWindow() {
        await this.activate();

        wbManager.clearSelection()
        var hwv = this.getHWV();
        hwv.setMinimumFramerate(0);


        var olddims = this.getDimensions()
        var newdims = {
            left: olddims.left + olddims.width + olddims.width / 3, top: olddims.top,
            width: olddims.width, height: olddims.width
        };
        var viewerstate = new hcModelState();
        viewerstate.camera = this.getHWV().getView().getCamera().copy();

        var newviewer = await this._newViewerFromCurrent(this.getModelName(), newdims, viewerstate);
        hwv.setMinimumFramerate(10);
        this.connectWindow(newviewer);
        newviewer.activate();
        newviewer.setShape(wbItemShape.circle);
    }

   
    async explodeToNewWindow() {
        await this.activate();

        var hwv = this.getHWV();
        hwv.setMinimumFramerate(0);

        var olddims = this.getDimensions()
        var newdims = {
            left: olddims.left + olddims.width + olddims.width / 3, top: olddims.top,
            width: olddims.width, height: olddims.height
        };
        var viewerstate = new hcModelState();
        viewerstate.camera = this.getHWV().getView().getCamera().copy();
        viewerstate.explode = 1.5;

        this._newViewerFromCurrent(this.getModelName(), newdims, viewerstate);
        hwv.setMinimumFramerate(10);

    }

    async standardViewsToNewWindow() {
        await this.activate();

        var hwv = this.getHWV();
        hwv.setMinimumFramerate(0);

        var olddims = this.getDimensions()

        var adder = olddims.width + olddims.width / 50
        var newdims = { left: adder + olddims.left + olddims.width + olddims.width / 50, top: olddims.top, width: olddims.width, height: olddims.height };
        await hwv.view.setViewOrientation(Communicator.ViewOrientation.Front, 0);
        var viewerstate = new hcModelState();
        viewerstate.camera = this.getHWV().getView().getCamera().copy();

        await this._newViewerFromCurrent(this.getModelName(), newdims, viewerstate);

        newdims = { left: adder + olddims.left + olddims.width + olddims.width / 50, top: olddims.top + olddims.height + olddims.width / 50, width: olddims.width, height: olddims.height };
        await hwv.view.setViewOrientation(Communicator.ViewOrientation.Right, 0);
        viewerstate = new hcModelState();
        viewerstate.camera = this.getHWV().getView().getCamera().copy();

        await this._newViewerFromCurrent(this.getModelName(), newdims, viewerstate);

        newdims = { left: adder + olddims.left, top: olddims.top + olddims.height + olddims.width / 50, width: olddims.width, height: olddims.height };
        await hwv.view.setViewOrientation(Communicator.ViewOrientation.Top, 0);

        viewerstate = new hcModelState();
        viewerstate.camera = this.getHWV().getView().getCamera().copy();
        await this._newViewerFromCurrent(this.getModelName(), newdims, viewerstate);


        newdims = { left: adder + olddims.left, top: olddims.top, width: olddims.width, height: olddims.height };
        await hwv.view.setViewOrientation(Communicator.ViewOrientation.TopRight, 0);

        viewerstate = new hcModelState();
        viewerstate.camera = this.getHWV().getView().getCamera().copy();
        await this._newViewerFromCurrent(this.getModelName(), newdims, viewerstate);
        hwv.setMinimumFramerate(10);
    }

    async CADViewstoNewWindow() {

        await this.activate();

        var hwv = this.getHWV();

        hwv.setMinimumFramerate(0);
        var sels = [];
        var cvmap = hwv.model.getCadViewMap();
        for (let [key, value] of cvmap) {
            sels.push(key);
        }


        var olddims = this.getDimensions()
        var totalwidth = olddims.width / 2 * 1.2 * (sels.length);

        for (var i = 0; i < sels.length; i++) {
            var newdims = {
                left: (olddims.left + olddims.width / 2) - totalwidth / 2 + (olddims.width / 2 * 1.2) * i, top: olddims.top + olddims.height * 1.2,
                width: olddims.width / 2, height: olddims.height / 2
            };
            var viewerstate = new hcModelState();
            viewerstate.cadView = sels[i];
            await this._newViewerFromCurrent(this.getModelName(), newdims, viewerstate);
        }
        hwv.setMinimumFramerate(10);
    }

  

    _gatherMeshId(nodeid, hwv, mhash) {
        var _this = this;
        var lst = new Promise(function (resolve, reject) {

            hwv.model.getMeshIds([nodeid]).then(function (meshid) {
                mhash[nodeid] = meshid;
                resolve();
            });
        });
        return lst;
    }


    gatherMatchingNodesRecursive(text, id,hwv, matchingnodes) {       
        if (hwv.model.getNodeName(id).toLowerCase().indexOf(text.toLowerCase()) != -1) {
            var current = id;
            var chain = [];
            chain.push(hwv.model.getNodeName(id))
            while (1) {
                var newone = hwv.model.getNodeParent(current);
                if (newone == null || newone == hwv.model.getRootNode())
                    break;
                chain.push(hwv.model.getNodeName(newone));
                current = newone;
            }
            var chaintext = "";
            for (var j = chain.length - 1; j >= 0; j--) {
                if (j > 0)
                    chaintext += chain[j] + "->";
                else
                    chaintext += chain[j];
            }

            var match = { name: hwv.model.getNodeName(id), chain: chaintext, id: id, selected: hwv.selectionManager.isSelected(Communicator.Selection.SelectionItem.create(id)) };

            matchingnodes.push(match);
        }
        var children = hwv.model.getNodeChildren(id);
        for (var i = 0; i < children.length; i++) {
            this.gatherMatchingNodesRecursive(text, children[i], hwv, matchingnodes);

        }
       
    }


    gatherMatchingNodes(text) {
        var matchingnodes = [];
        this.gatherMatchingNodesRecursive(text, this.getHWV().model.getRootNode(), this.getHWV(), matchingnodes);
         return matchingnodes;
    }


 
    _gatherMeshidsRecursive(hwv,nodeid, mhash,proms, maxdepth, depth) {       
        proms.push(this._gatherMeshId(nodeid, hwv, mhash));
        var children = hwv.model.getNodeChildren(nodeid);
        for (var i = 0; i < children.length; i++) {
            this._gatherMeshidsRecursive(hwv,children[i], mhash, proms, maxdepth, depth + 1);
        }
    }

    _gatherMeshids(hwv, mhash, maxdepth) {
        var _this = this;
        
        var lst = new Promise(function (resolve, reject) {
            var proms = [];
            _this._gatherMeshidsRecursive(hwv, hwv.model.getRootNode(), mhash, proms, maxdepth, 0);
            Promise.all(proms).then(function () {
                resolve();
            });
        });
        return lst;
    }



    _gatherMeshidsRecursive2(hwv, g, nodeid, mhash, maxdepth, depth) {
        if (depth > maxdepth)
            return;
        var children = hwv.model.getNodeChildren(nodeid);
        if (children.length == 0) {
            g.setEdge(nodeid.toString(),"@" + mhash[nodeid][0][1]);
        }
        for (var i = 0; i < children.length; i++) {
            this._gatherMeshidsRecursive2(hwv,g , children[i], mhash,maxdepth, depth + 1);
        }
    }
    
   
    async sheetsToNewWindow() {        

        await this.activate();

        var hwv = this.getHWV();
        hwv.setMinimumFramerate(0);
        var sels = hwv.sheetManager.getSheetIds();
    
        var olddims = this.getDimensions()
        var totalwidth = olddims.width / 2 * 1.2 * (sels.length);

        for (var i = 0; i < sels.length; i++) {
            var newdims = {
                left: (olddims.left + olddims.width / 2) - totalwidth / 2 + (olddims.width / 2 * 1.2) * i, top: olddims.top + olddims.height * 1.2,
                width: olddims.width / 2, height: olddims.height / 2
            };
            var viewerstate = new hcModelState();
            viewerstate.sheet = sels[i];

            await this._newViewerFromCurrent(this.getModelName(), newdims, viewerstate);
        }
        hwv.setMinimumFramerate(0);
    }

    async floorsToNewWindow() {      
        await this.activate();

        var hwv = this.getHWV();
        hwv.setMinimumFramerate(0)
        var c = hwv.model.getNodeChildren(hwv.model.getRootNode());
        c = hwv.model.getNodeChildren(c[0]);
        c = hwv.model.getNodeChildren(c[0]);
        c = hwv.model.getNodeChildren(c[0]);
        var sels = hwv.model.getNodeChildren(c[0]);

        var olddims = this.getDimensions()
        var totalwidth = olddims.width / 2 * 1.2 * (sels.length);

        for (var i = 0; i < sels.length; i++) {
            var newdims = {
                left: (olddims.left + olddims.width / 2) - totalwidth / 2 + (olddims.width / 2 * 1.2) * i, top: olddims.top + olddims.height * 1.2,
                width: olddims.width / 2, height: olddims.height / 2
            };
            var viewerstate = new hcModelState();
            viewerstate.isolateNode = sels[i];
            await this._newViewerFromCurrent(this.getModelName(), newdims, viewerstate);
        }
        hwv.setMinimumFramerate(10);
    }         
}

