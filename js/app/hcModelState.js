function hcModelState() {

    function getSelectedNodes(hwv) {
        var selNodes = [];
        var r = hwv.selectionManager.getResults();
        for (var i = 0; i < r.length; i++)
            selNodes.push(r[i].getNodeId());
        return selNodes;
    }
    
    return {
        camera: undefined,
        isolateNode: undefined,
        cadView: undefined,
        sheet: undefined,
        explode: undefined,
        drawMode: undefined,
        ambientOcclusion: undefined,
        bloom: undefined,
        projectionMode: undefined,
        measureData: undefined,
        selectedNodes: undefined,
        initialize: function () {
        },
        duplicate: function () {
            var newstate = new hcModelState;
            newstate.copy(this);
            newstate.camera = this.camera.copy();
            return newstate;
        },
        saveStatesFromHWV: function (hwv) {
            this.camera = hwv.view.getCamera().copy();
            this.drawMode = hwv.view.getDrawMode();
            this.ambientOcclusion = hwv.view.getAmbientOcclusionEnabled();
            this.bloom = hwv.view.getBloomEnabled();
            this.projectionMode = hwv.view.getProjectionMode();
            this.measureData = JSON.stringify(hwv.measureManager.exportMarkup());
            this.selectedNodes = getSelectedNodes(hwv);

        },
        copy: function (newstate) {
            this.isolateNode = newstate.isolateNode;
            this.cadView = newstate.cadView;
            this.sheet = newstate.sheet;
            this.explode = newstate.explode;
            this.drawMode = newstate.drawMode;
            this.ambientOcclusion = newstate.ambientOcclusion;
            this.bloom = newstate.bloom;
            this.projectionMode = newstate.projectionMode;
            this.selectedNodes =  newstate.selectedNodes;
        },      
        saveCamera: function (cam) {
            this.camera = cam;
        },
        getCamera: function () {
            return this.camera;
        },
        apply: function (hwv) {
            var _this = this;
            var lst = new Promise(function (resolve, reject) {

                if (_this.explode != undefined) {
                    hwv.explodeManager.setMagnitude(_this.explode).then(function () {
                        resolve();
                    });
                }
                else if (_this.isolateNode != undefined) {
                    if (typeof _this.isolateNode == "number") {
                        hwv.view.isolateNodes([_this.isolateNode], 0).then(function () {
                            resolve();
                        });
                    }
                    else
                    {
                        hwv.view.isolateNodes(_this.isolateNode, 0).then(function () {
                            resolve();
                        });
                    }
                }
                else if (_this.cadView != undefined) {
                    hwv.model.activateCadView(_this.cadView, 0).then(function () {
                        resolve();
                    });
                }
                else if (_this.sheet != undefined) {
                    hwv.view.isolateNodes([_this.sheet], 0).then(function () {
                        resolve();
                    });
                }
                else
                    resolve();
            });
            return lst;
        },
        activate: function (hwv) {
            var _this = this;
            var lst = new Promise(function (resolve, reject) {
                hwv.selectionManager.setNodeSelectionColor(new Communicator.Color(255, 0, 0))
                hwv.selectionManager.setNodeElementSelectionColor(new Communicator.Color(255, 0, 0))
                hwv.selectionManager.setNodeSelectionOutlineColor(new Communicator.Color(255, 0, 0))
                hwv.view.setAmbientOcclusionEnabled(false);
                hwv.view.setBloomEnabled(false);
                hwv.view.setBackfacesVisible(true);
                hwv.explodeManager.setMagnitude(0);
                var hiddenLineSettings = hwv.view.getHiddenLineSettings();
                hwv.sheetManager.setBackgroundSheetEnabled(false);
                hiddenLineSettings.setObscuredLineOpacity(0);
                hwv.view.setDrawMode(Communicator.DrawMode.WireframeOnShaded);
                hwv.measureManager.removeAllMeasurements();
                hwv.setMinimumFramerate(wbItemHC.minFramerate);
                hwv.selectionManager.clear();
                hwv.reset(0).then(function () {
                    if (_this.drawMode != undefined) {
                        hwv.view.setDrawMode(_this.drawMode);
                    }
                    if (_this.ambientOcclusion != undefined) {
                        hwv.view.setAmbientOcclusionEnabled(_this.ambientOcclusion);
                    }
                    if (_this.bloom != undefined) {
                        hwv.view.setBloomEnabled(_this.bloom);
                    }
                    if (_this.projectionMode != undefined) {
                        hwv.view.setProjectionMode(_this.projectionMode);
                    }
                    if (_this.measureData != undefined) {
                        hwv.measureManager.loadData(JSON.parse(_this.measureData));
                    }
                    if (_this.selectedNodes != undefined) {
                        for (var i = 0; i < _this.selectedNodes.length; i++)
                            hwv.selectionManager.selectNode(_this.selectedNodes[i], Communicator.SelectionMode.Add);
                    }
                    if (_this.isolateNode != undefined) {
                        if (typeof _this.isolateNode == "number") {
                            hwv.view.isolateNodes([_this.isolateNode], 0).then(function () {
                                hwv.view.setCamera(_this.camera, 0);
                                resolve();
                            });
                        }
                        else {
                            hwv.view.isolateNodes(_this.isolateNode, 0).then(function () {
                                hwv.view.setCamera(_this.camera, 0);
                                resolve();
                            });
                        }
                    }
                    else if (_this.sheet != undefined) {
                        hwv.view.isolateNodes([_this.sheet], 0).then(function () {
                            hwv.view.setCamera(_this.camera, 0);
                            resolve();
                        });
                    }
                    else if (_this.cadView != undefined) {
                        hwv.model.activateCadView(_this.cadView, 0).then(function () {
                            hwv.view.setCamera(_this.camera, 0);
                            resolve();

                        });
                    }
                    else if (_this.explode != undefined) {
                        hwv.explodeManager.setMagnitude(_this.explode).then(function () {
                            hwv.view.setCamera(_this.camera, 0);
                            resolve();
                        });
                    }
                    else {
                        if (_this.camera != undefined) {
                            hwv.view.setCamera(_this.camera, 0);
                        }
                        resolve();
                    }
                });
            });
            return lst;
        }
    }
}

