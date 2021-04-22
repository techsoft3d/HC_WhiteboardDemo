function menuManager_() {
    var menus = [];

    var loadnewmodelbutton;
    var derivedbutton;
    var rendermodebutton;
    var textsizebutton;
    var textfontbutton;
    var standardviewbutton;
    var projectionbutton;
    var operatormenubutton;
    var leftarrowbutton;
    var rightarrowbutton
    return {


        initialize: function () {
            var d = $(document.body)
            var boundingrect = d[0].getBoundingClientRect();


            var m3 = new menu("createcad")
            m3.setPosition(boundingrect.width / 2, boundingrect.height / 2);

            m3.addItem("arboleda", "arboleda.png", this.addModelFromMenu)
            m3.addItem("cfd", "cfd.png", this.addModelFromMenu)
            m3.addItem("drawing", "drawing.png", this.addModelFromMenu)
            m3.addItem("EnginePoints", "EnginePoints.png", this.addModelFromMenu)
            m3.addItem("hammer", "hammer.png", this.addModelFromMenu)
            m3.addItem("HotelFloorplan", "HotelFloorplan.png", this.addModelFromMenu)
            m3.addItem("landinggear", "landinggear.png", this.addModelFromMenu)
            m3.addItem("PartWithPMI", "PartWithPMI.png", this.addModelFromMenu)
            m3.addItem("microengine", "microengine.png", this.addModelFromMenu)
            m3.addItem("motorcycle", "moto.png", this.addModelFromMenu)
            m3.addItem("phone", "phone.png", this.addModelFromMenu)
            m3.addItem("turbine", "turbine.png", this.addModelFromMenu, "Drone")
            m3.addItem("racbasicsampleproject", "rac_basic_sample_project.png", this.addModelFromMenu, "Revit")
            m3.addItem("MountainHome", "MountainHome.png", this.addModelFromMenu)
            m3.addItem("DamagedHelmet", "DamagedHelmet.png", this.addModelFromMenu)
            m3.addItem("emptymodel", "emptymodel.png", this.addModelFromMenu)
            m3.setOrientation(menuOrientation.box);
            m3.setBoxDimensions(5, 5);
            m3.setImageSize(64, 50);



            var m2 = new menu("colors")
            m2.addItem("transparent", "transparent.png")
            m2.addItem("grey2", "rgb(255,255,255)")
            m2.addItem("grey3", "rgb(210,210,210)")
            m2.addItem("grey4", "rgb(150,150,150)")
            m2.addItem("grey5", "rgb(64,64,64)")
            m2.addItem("grey6", "rgb(0,0,0)")
            m2.addItem("red1", "rgb(255,128,128)")
            m2.addItem("red2", "rgb(255,0,0)")
            m2.addItem("red3", "rgb(210,0,0)")
            m2.addItem("red4", "rgb(170,0,0)")
            m2.addItem("red5", "rgb(130,0,0)")
            m2.addItem("red6", "rgb(64,0,0)")
            m2.addItem("green1", "rgb(128,255,128)")
            m2.addItem("green2", "rgb(0,255,0)")
            m2.addItem("green3", "rgb(0,210,0)")
            m2.addItem("green4", "rgb(0,170,0)")
            m2.addItem("green5", "rgb(0,130,0)")
            m2.addItem("green6", "rgb(0,64,0)")
            m2.addItem("blue1", "rgb(128,128,255)")
            m2.addItem("blue2", "rgb(0,0,255)")
            m2.addItem("blue3", "rgb(0,0,210)")
            m2.addItem("blue4", "rgb(0,0,170)")
            m2.addItem("blue5", "rgb(0,0,130)")
            m2.addItem("blue6", "rgb(0,0,64)")
            m2.addItem("yellow1", "rgb(255,241,170)")
            m2.addItem("yellow2", "rgb(255,255,0)")
            m2.addItem("yellow3", "rgb(210,210,0)")
            m2.addItem("yellow4", "rgb(170,170,0)")
            m2.addItem("yellow5", "rgb(130,130,0)")
            m2.addItem("yellow6", "rgb(64,64,0)")
            m2.setOrientation(menuOrientation.box);
            m2.setBoxDimensions(6, 5);
          

            var m4 = new menu("otheritems")
            m4.addItem("createblank", "blank.png", this.insertBlankItem, 0, true, m2, "Create Blank")
            m4.addItem("createtexteditornote", "text.png", this.insertBlankItem, 1, true, m2, "Create Text Editor")

            var m7 = new menu("derived")
            m7.addItem("Duplicate", "derived_duplicate.png", this.setDerived)
            m7.addItem("Standard Views", "derived_standard.png", this.setDerived)
            m7.addItem("Isolate", "derived_isolate.png", this.setDerived)
            m7.addItem("Isolate2", "derived_isolate2.png", this.setDerived)
            m7.addItem("CAD Views", "derived_cadviews.png", this.setDerived)
            m7.addItem("Sheets", "derived_sheets.png", this.setDerived)
            m7.addItem("Floors", "derived_floors.png", this.setDerived)
            m7.addItem("Unique Meshes", "derived_unique.png", this.setDerived)
            m7.addItem("Explode", "derived_explode.png", this.setDerived)
            m7.setOrientation(menuOrientation.box);
            m7.setImageSize(128, 100);
            m7.setBoxDimensions(4, 4);

            var m8 = new menuTextSize("size")
            m8.setOrientation(menuOrientation.vertical);

            var m9 = new menuTextFont("font")
            m9.setOrientation(menuOrientation.vertical);

            var m10 = new menu("rendermodes")
            m10.addItem("Shaded with Lines", "rm_shadedwithlines.png", this.setRendermode)
            m10.addItem("Shaded", "rm_shaded.png", this.setRendermode)
            m10.addItem("Hidden Line", "rm_hiddenline.png", this.setRendermode)
            m10.addItem("Wireframe", "rm_wireframe.png", this.setRendermode)
            m10.addItem("XRay", "rm_xray.png", this.setRendermode)
            m10.addItem("AmbientOcclusion", "ao.png", this.setRendermode,0,true)
            m10.addItem("Bloom", "bloom.png", this.setRendermode, 0, true)
           
            m10.setOrientation(menuOrientation.vertical);
            m10.setImageSize(28, 28);

            var m11 = new menu("standardviewmenu")
            m11.addItem("Front View", "view_front.png", this.setStandardViews)
            m11.addItem("Back View", "view_back.png", this.setStandardViews)
            m11.addItem("Left View", "view_left.png", this.setStandardViews)
            m11.addItem("Right View", "view_right.png", this.setStandardViews)
            m11.addItem("Top View", "view_up.png", this.setStandardViews)
            m11.addItem("Down View", "view_down.png", this.setStandardViews)
            m11.addItem("Iso View", "view_iso.png", this.setStandardViews)

            m11.setOrientation(menuOrientation.vertical);
            m11.setImageSize(28, 28);




            var m19 = new menuAppearance("menuAppearance")
            m19.setOrientation(menuOrientation.horizontal);

       







            var m18 = new menu("operatormenu")
            m18.addItem("Orbit", "orbitoperator.png", this.setOperator)
            m18.addItem("Walk", "walkoperator.png", this.setOperator)
            m18.addItem("EdgeLength", "edgelengthoperator.png", this.setOperator)
            m18.addItem("PointPoint", "pointpointoperator.png", this.setOperator)
            m18.addItem("NoMeasure", "nomeasure.png", this.setOperator)



            var m20 = new menu("leftarrowmenu")
            m20.addItem("Left Arrow", "arrowleft.png", this.setEndArrows)
            m20.addItem("No Arrow Left", "arrownone.png", this.setEndArrows)
          
            var m21 = new menu("rightarrowmenu")
            m21.addItem("Right Arrow", "arrowright.png", this.setEndArrows)
            m21.addItem("No Arrow Right", "arrownone.png", this.setEndArrows)



            var m5 = new menu("selmenu")
            loadnewmodelbutton = m5.addItem("loadnewmodel", "createmodel.png", undefined, 0, true, m3, "Replace Model")
            derivedbutton = m5.addItem("derived", "derived.png", undefined, 0, true, m7, "Derive from Model")
            rendermodebutton = m5.addItem("rendermodes", "rendermodes.png", undefined, 0, true, m10, "Render Modes")
            standardviewbutton = m5.addItem("standardviews", "viewmenu.png", undefined, 0, true, m11, "Standard Views")
            projectionbutton = m5.addItem("Projection", "projection.png", this.setProjection, 0, true, undefined, "Perspective/Orthographic")
            operatormenubutton = m5.addItem("Operators", "operators.png", undefined, 0, true, m18, "Perspective/Orthographic")
            leftarrowbutton = m5.addItem("LeftArrowChoice", "arrowleft.png", undefined, 0, true, m20, "Set End Arrows")
            m5.addItem("appearancemenu", "appearance.png", undefined, 1, true, m19, "Set Appearance")
            rightarrowbutton = m5.addItem("RightArrowChoice", "arrowright.png", undefined, 0, true, m21, "Set End Arrows")

            textsizebutton = m5.addItem("textsize", "textsize.png",undefined, 1, true, m8, "Text Size")
            textfontbutton = m5.addItem("textfont", "textfont.png", undefined, 1, true, m9, "Text Font")
            m5.setOrientation(menuOrientation.horizontal);



   




            var m17 = new menu("curveitems")
            m17.addItem("newcurveline", "lineline.png", this.newCurve, 1, false, undefined, "New Curve")
            m17.addItem("newcurvecurve", "linecurve.png", this.newCurve, 1, false, undefined, "New Curve")
            m17.addItem("newcurvestep", "linestep.png", this.newCurve, 1, false, undefined, "New Curve")

            var m = new menu("main")
            m.setPosition(50, boundingrect.height / 2);
            m.addItem("createmodel", "createmodel.png", undefined, 1, true,m3, "Create Model Item")
            m.addItem("creatitem", "create.png", undefined, 1, true, m4, "Create Item")
            m.addItem("createtexteditortext", "text2.png", this.insertBlankItem, 1, false, undefined, "Create Text Editor")
            m.addItem("curveoptions", "newcurve.png", undefined, 1, true, m17, "Create Item")


           



            this.addMenu(m);
            this.addMenu(m2);
            this.addMenu(m3);
            this.addMenu(m4);
            this.addMenu(m5);
            this.addMenu(m7);
            this.addMenu(m8);
            this.addMenu(m9);
            this.addMenu(m10);
            this.addMenu(m11);
            this.addMenu(m17);
            this.addMenu(m18);
            this.addMenu(m19);
            this.addMenu(m20);
            this.addMenu(m21);

            m.setOrientation(menuOrientation.vertical);
            m.display();
            

        },
        newCurve: function (item) {
            if (item.name == "newcurveline")
                wbLine.setNewLineMode(wbLineType.straight);
            else if (item.name == "newcurvecurve")
                wbLine.setNewLineMode(wbLineType.curve);
            else if (item.name == "newcurvestep")
                wbLine.setNewLineMode(wbLineType.step);
        },
        addMenu : function(menu) {
            menus.push(menu);
        },   
        getByName(name) {
            for (var i = 0; i < menus.length; i++) {
                if (menus[i].getName() == name)
                    return menus[i];
            }
            return undefined;
        },        
        async setOperator(item, parentitem) {
            var opid;
            if (item.name == "Orbit")
                opid = Communicator.OperatorId.Navigate;
            else if (item.name == "Walk")
                opid = Communicator.OperatorId.KeyboardWalk
            else if (item.name == "EdgeLength")
                opid = Communicator.OperatorId.MeasureEdgeLength
            else if (item.name == "PointPoint")
                opid = Communicator.OperatorId.MeasurePointPointDistance

            var selitems = wbManager.getSelectedItems();
            for (var i = 0; i < selitems.length; i++) {
                if (selitems[i].getType() == wbItemType.wbItemHC) {
                    var wasactive = selitems[i].getActive();
                    await selitems[i].activate();
                    var hwv = selitems[i].getHWV();
                    if (opid == Communicator.OperatorId.MeasureEdgeLength || opid == Communicator.OperatorId.MeasurePointPointDistance)
                        hwv.operatorManager.set(opid, 1);                    
                    else if (opid == undefined)
                        hwv.operatorManager.set(Communicator.OperatorId.Select, 1);               
                    else 
                        hwv.operatorManager.set(opid, 0);               

                }
            }
        },
        async setStandardViews(item, parentitem) {
            var standardview;
            if (item.name == "Front View")
                standardview = Communicator.ViewOrientation.Front;
            else if (item.name == "Back View")
                standardview = Communicator.ViewOrientation.Back;
            else if (item.name == "Left View")
                standardview = Communicator.ViewOrientation.Left;
            else if (item.name == "Right View")
                standardview = Communicator.ViewOrientation.Right;
            else if (item.name == "Top View")
                standardview = Communicator.ViewOrientation.Top;
            else if (item.name == "Down View")
                standardview = Communicator.ViewOrientation.Bottom;
            else if (item.name == "Iso View")
                standardview = Communicator.ViewOrientation.Iso;

            var selitems = wbManager.getSelectedItems();
            var hccount = 0;

            for (var i = 0; i < selitems.length; i++) {
                if (selitems[i].getType() == wbItemType.wbItemHC)
                    hccount++;
            }
            for (var i = 0; i < selitems.length; i++) {
                if (selitems[i].getType() == wbItemType.wbItemHC) {
                    var wasactive = selitems[i].getActive();
                    await selitems[i].activate();
                    var hwv = selitems[i].getHWV();
                    if (hccount > 1 || wasactive == false)
                        await hwv.view.setViewOrientation(standardview, 0);
                    else
                        await hwv.view.setViewOrientation(standardview, 500);
                    if (hccount > 1)
                        await selitems[i].deactivate();
                }
            }
        },
        async setProjection(item, parentitem) {
            var projection;
            if (item.isToggled())
                projection = Communicator.Projection.Perspective;
            else
                projection = Communicator.Projection.Orthographic;
            var selitems = wbManager.getSelectedItems();
            var hccount = 0;
            for (var i = 0; i < selitems.length; i++) {
                if (selitems[i].getType() == wbItemType.wbItemHC)
                    hccount++;
            }
            for (var i = 0; i < selitems.length; i++) {
                if (selitems[i].getType() == wbItemType.wbItemHC) {
                    await selitems[i].activate();
                    var hwv = selitems[i].getHWV();
                    await hwv.view.setProjectionMode(projection);
                    if (hccount > 1)
                        await selitems[i].deactivate();

                }
            }
        },

        async setRendermode(item, parentitem) {
            var rendermode;
            var ao,bloom;
            if (item.name == "Shaded with Lines")
                rendermode = Communicator.DrawMode.WireframeOnShaded;
            else if (item.name == "Shaded")
                rendermode = Communicator.DrawMode.Shaded;
            else if (item.name == "Hidden Line")
                rendermode = Communicator.DrawMode.HiddenLine;
            else if (item.name == "Wireframe")
                rendermode = Communicator.DrawMode.Wireframe;
            else if (item.name == "XRay")
                rendermode = Communicator.DrawMode.XRay;
            else if (item.name == "AmbientOcclusion")
                ao = item.isToggled();
            else if (item.name == "Bloom")
                bloom = item.isToggled();
            var selitems = wbManager.getSelectedItems();
            var hccount = 0;

            for (var i = 0; i < selitems.length; i++) {
                if (selitems[i].getType() == wbItemType.wbItemHC)
                    hccount++;
            }
            for (var i = 0; i < selitems.length; i++) {
                if (selitems[i].getType() == wbItemType.wbItemHC) {
                    await selitems[i].activate();
                    var hwv = selitems[i].getHWV();
                    if (ao != undefined)
                        await hwv.view.setAmbientOcclusionEnabled(ao);
                    else if (bloom != undefined)
                        await hwv.view.setBloomEnabled(bloom);
                    else {
                        await hwv.view.setDrawMode(rendermode);
                    }
                    if (hccount > 1)
                        await selitems[i].deactivate();

                }
            }
        },
        setDerived(item, parentitem) {
            var selitems = wbManager.getSelectedItems();
            for (var i = 0; i < selitems.length; i++) {
                if (selitems[i].getType() == wbItemType.wbItemHC) {
                    if (item.name == "Duplicate")
                        selitems[i].duplicateToNewWindow();
                    else if (item.name == "Standard Views")
                        selitems[i].standardViewsToNewWindow();
                    else if (item.name == "Isolate")
                        selitems[i].isolateToNewWindow();
                        else if (item.name == "Isolate2")
                        selitems[i].isolateAllToNewWindow();
                    else if (item.name == "CAD Views")
                        selitems[i].CADViewstoNewWindow();
                    else if (item.name == "Sheets")
                        selitems[i].sheetsToNewWindow();
                    else if (item.name == "Floors")
                        selitems[i].floorsToNewWindow();
                    else if (item.name == "Unique Meshes")
                        selitems[i].uniqueMeshesToNewWindow();
                    else if (item.name == "Explode")
                        selitems[i].explodeToNewWindow();
                    else if (item.name == "Magnifier")
                        selitems[i].magnifierToNewWindow();
                    else if (item.name == "Model Tree")
                        selitems[i].modelTreeToNewWindow();                  
                    break;
                }
            }
        },
        async addModelFromMenu(item, parentitem) {

            if (parentitem.name == "loadnewmodel") {
                var selitems = wbManager.getSelectedItems();
                for (var i = 0; i < selitems.length; i++) {
                    if (selitems[i].getType() == wbItemType.wbItemHC)
                        await wbItemHC.replace(item.name, selitems[i]);
                }
            }
            else {

                if (item.name == "emptymodel")
                    wbManager.addFromRectangle(undefined, wbItemType.wbItemHC, "rgb(255,255,255)");
                else
                    wbManager.addFromRectangle(item.name, wbItemType.wbItemHC, "rgb(255,255,255)");
            }
        },
        testExecute(extra) {
            var i = 0;
        },

        hideAll() {
            for (var i = 0; i < menus.length; i++) {
                if (menus[i].parent != undefined)
                    menus[i].hide(true);               
            }
        },
        setEndArrows(item, parentitem) {
            var leftarrowchoice = undefined;
            var rightarrowchoice = undefined;
            if (item.name == "Left Arrow")
                leftarrowchoice = true;
            if (item.name == "Right Arrow")
                rightarrowchoice = true;
            if (item.name == "No Arrow Left")
                leftarrowchoice = false;
            if (item.name == "No Arrow Right")
                rightarrowchoice = false;

            var m = menuManager.getByName("selmenu");
            if (leftarrowchoice != undefined) {

                if (leftarrowchoice == true)
                    leftarrowbutton.setImage("arrowleft.png", m);
                else
                    leftarrowbutton.setImage("arrownone.png", m);
            }

            if (rightarrowchoice != undefined) {

                if (rightarrowchoice == true)
                    rightarrowbutton.setImage("arrowleft.png", m);
                else
                    rightarrowbutton.setImage("arrownone.png", m);
            }


            var selitems = wbManager.getSelectedItems();
            for (var i = 0; i < selitems.length; i++) {
                if (leftarrowchoice != undefined)
                    selitems[i].drawStartArrow = leftarrowchoice;
                if (rightarrowchoice != undefined)
                    selitems[i].drawEndArrow = rightarrowchoice;                
            }

            wbManager.redraw();

        },
        setShape(item,parentitem) {
            if (item.name == "rectangleshape")
                wbManager.setShape(wbItemShape.rectangle);
            else if (item.name == "circleshape")
                wbManager.setShape(wbItemShape.circle);
            else
                wbManager.setShape(wbItemShape.roundedCornerRectangle);
        },
        mainMenu() {

            window.location = "./";
        },
        insertBlankItem(item, parentitem,parentmenu) {
            
            var imagecolor;
            if (item.imagename == "transparent.png")
                imagecolor = undefined;
            else
                imagecolor = item.imagename;
            if (item.name == "createtexteditortext") {
                wbManager.addFromRectangle("", wbItemType.wbItemTextEditorText, imagecolor);
                return;
            }
            if (parentitem != undefined) {
                if (parentitem.name == "backgroundcolor") {
                    wbManager.setBackgroundColor(imagecolor);
                }
                else if (parentitem.name == "createblank")
                    wbManager.addFromRectangle("", wbItemType.wbItem, imagecolor);
                else if (parentitem.name == "createtexteditornote")
                    wbManager.addFromRectangle("", wbItemType.wbItemTextEditorNote, imagecolor);
                else if (parentitem.name == "createtexteditortext")
                    wbManager.addFromRectangle("", wbItemType.wbItemTextEditorText, imagecolor);
            }
           
        },

        showSelectionMenu() {
            var selmenu = this.getByName("selmenu");
            var selitems = wbManager.getSelectedItems();
            if (selitems.length == 0) {
                selmenu.hide();
            }
            else {
                var hccount = 0;
                var textcount = 0;
                var modeltreecount = 0;
                var linecount = 0;
                for (var i = 0; i < selitems.length; i++) {
                    if (selitems[i].getType() == wbItemType.wbItemHC)
                        hccount++;
                    if (selitems[i].getType() == wbItemType.wbItemTextEditor)
                        textcount++;
                 
                    if (selitems[i].getType() == wbItemType.wbItemModelTree)
                        modeltreecount++;
                    if (selitems[i].getType() == wbItemType.wbLine)
                        linecount++;
                }
                loadnewmodelbutton.hidden = false;
                rendermodebutton.hidden = false;
                standardviewbutton.hidden = false;
                projectionbutton.hidden = false;
                operatormenubutton.hidden = false;
                derivedbutton.hidden = false;
                textsizebutton.hidden = true;
                textfontbutton.hidden = true;
                leftarrowbutton.hidden = true;
                rightarrowbutton.hidden = true;

                if (hccount == 0) {
                    loadnewmodelbutton.hidden = true;
                    derivedbutton.hidden = true;
                    rendermodebutton.hidden = true;
                    standardviewbutton.hidden = true;
                    projectionbutton.hidden = true;
                    operatormenubutton.hidden = true;
                }
                else if (hccount > 1)
                    derivedbutton.hidden = true;

                if (textcount == 1 && selitems.length == 1) {
                    textsizebutton.hidden = false;
                    textfontbutton.hidden = false;
                }
                if (linecount == selitems.length) {
                    var item = selitems[0];
                    leftarrowbutton.hidden = false;
                    rightarrowbutton.hidden = false;

                    var m = menuManager.getByName("selmenu");
                    if (item.drawStartArrow == true)
                        leftarrowbutton.setImage("arrowleft.png", m);
                    else
                        leftarrowbutton.setImage("arrownone.png", m);

                    if (item.drawEndArrow == true)
                        rightarrowbutton.setImage("arrowright.png", m);
                    else
                        rightarrowbutton.setImage("arrownone.png", m);

                }



                var bounding = wbManager.calculateCombinedBounding(selitems);
                var pos = wbManager.convertCanvasToWindowCoordinates(bounding);
                selmenu.setPosition(pos.left + pos.width / 2, pos.top - 50);
                selmenu.display();                
            }

        },
        hideSelectionMenu() {
            var selmenu = this.getByName("selmenu");
            selmenu.hide();
        }
    };   
}

var menuManager = new menuManager_();