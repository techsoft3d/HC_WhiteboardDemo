function hcmodel() {

    var hwv;   
    var modelname;
    var windowguid;
    var hcMagnifierOperatorHandle;

    function gatherMeshes(nodeid, uhash) {
        var lst = new Promise(function (resolve, reject) {
            hwv.model.getMeshIds([nodeid]).then(function (mids) {
                if (mids.length > 0)
                    uhash[mids[0][1]] = nodeid;
                resolve();
            });
        });
        return lst;
    }
    function findUniqueMeshesRecursive(node, promlist, uhash) {
        var children = hwv.model.getNodeChildren(node);
        if (children.length == 0) {
            promlist.push(gatherMeshes(node, uhash));            
        }
        for (var i = 0; i < children.length; i++)
            findUniqueMeshesRecursive(children[i], promlist, uhash);
    }       
     
    return {
        initialize: function (inputmodelname, guid) {
            modelname = inputmodelname;
            windowguid = guid;
            var x = '<div id="' + this.getDiv() + '" style="overflow:hidden"></div>\n';
            $("#" + hcModelCache.getOffscreenContainer()).append(x);
        },
        activateHWV: function (activecontainerid, item, stateCallback) {
            $("#" + activecontainerid).append($("#" + this.getDiv()));
            if (hwv == undefined) {
                var renderingLocation = "csr";
                var uriRoot = "ws://localhost:11180"
                var fullUri = uriRoot + "?renderingLocation=" + renderingLocation;
                var divname = this.getDiv();
                $("#" + divname).empty();
                var config;
                if (hcModelCache.getSCSLoading() == false) {
                    config = {
                        containerId: divname,
                        endpointUri: fullUri,
                        model: modelname,
                        rendererType: 0,
                        streamingMode: 1,
                        memoryLimit: 0,
                        boundingPreviewMode: Communicator.BoundingPreviewMode.None
                    };
                }
                else {

                    var config = {
                        containerId: divname,
                        endpointUri: "scs\\" + modelname + ".scs",
                    };
                }
                Sample._applyExtraProperties(config);
                hwv = new Communicator.WebViewer(config);
                var _this = this;
                hwv.setCallbacks({
                    sceneReady: function () {
                        var op = new hcMagnifierOperator(_this.getHWV());
                        op.setItem(item);
                        _this.sethcMagnifierOperatorHandle(op);
                        hwv.operatorManager.push(hcMagnifierOperatorHandle);
                    },
                    modelStructureReady: stateCallback
                });

//                hwv.operatorManager.push(hcMagnifierOperatorHandle);



                hwv.start();
            }
            else {
                var mangifierOperator = hwv.operatorManager.getOperator(hcMagnifierOperatorHandle);
                mangifierOperator.setItem(item);

                hwv.resizeCanvas();
                stateCallback();
            }
        },
        sethcMagnifierOperatorHandle: function (op) {
            hcMagnifierOperatorHandle = this.getHWV().registerCustomOperator(op);
        },
        findUniqueMeshes: function () {           
            var lst = new Promise(function (resolve, reject) {
                var promlist = [];
                var uhash = [];
                findUniqueMeshesRecursive(hwv.model.getRootNode(), promlist, uhash);
                Promise.all(promlist).then(function () {
                    resolve(uhash);
                });
            });
            return lst;
        },
        deactivateHWV: function () {
            $("#" + hcModelCache.getOffscreenContainer()).append($("#" + this.getDiv()));
//            getHWV().shutdown();
        },
        getHWV: function () {
            return hwv;
        },
        getDiv: function () {
            if (windowguid == undefined)
                return "hc-" + modelname;
            else
                return "hc-" + modelname + windowguid;
        }

     }

}



function hcModelCache_() {
    var offscreencontainer;
    var models = [];
    var scsLoading = true;

    function activeViewersClash(modelname, guid) {

        var items = wbManager.getItems();
        for (var v = 0; v < items.length; v++) {
            if (items[v].getType() == wbItemType.wbItemHC &&
                items[v].getActive() == true && items[v].getGUID() != guid && items[v].getModelName() == modelname)
                return true;
        }
        return false;
    }

   


    return {
        initialize: function (container) {
            offscreencontainer = container;
        },
        getModel: function (modelname, guid) {
            if (models[modelname + guid] != undefined)
                return models[modelname + guid];

            if (models[modelname] == undefined) {
                models[modelname] = new hcmodel(); 
                models[modelname].initialize(modelname);
                return models[modelname];
            }

            if (activeViewersClash(modelname, guid)) {
                models[modelname + guid] = new hcmodel();
                models[modelname + guid].initialize(modelname,guid);
                return models[modelname + guid];
            }
            else
                return models[modelname];


        },
        getOffscreenContainer: function () {
            return offscreencontainer;
        },
        setSCSLoading(scstruefalse) {
            scsLoading = scstruefalse;
        },
        getSCSLoading() {
            return scsLoading;
        }


    }   

  
};

var hcModelCache = new hcModelCache_();