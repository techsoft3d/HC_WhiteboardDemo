class menuAppearance extends menu {

    static mouseClick(x) {
        var id = x.id.split("_");

        if (id[0] == "backgroundcolor") {
            var items = wbManager.getSelectedItems();
            for (var i = 0; i < items.length; i++) {
                if (id[1] == "0")
                    items[i].setBackgroundColor();
                else
                    items[i].setBackgroundColor(menuAppearance.colorChoices[parseInt(id[1])]);
                    items[i].setDirty();
            }
            wbManager.redraw();
        }
        else {
            var items = wbManager.getSelectedItems();
            for (var i = 0; i < items.length; i++) {
                items[i].borderColor = menuAppearance.colorChoices[parseInt(id[1])];
            }
            wbManager.redraw();
        }
        var m = menuManager.getByName("menuAppearance");
        m.refresh();
    }

    static setBorderShape(shape) {
        wbManager.setShape(shape);
        var m = menuManager.getByName("menuAppearance");
        m.refresh();
    }

    static setBorderPattern(pattern) {
        var items = wbManager.getSelectedItems();
        for (var i = 0; i < items.length; i++)
        {
            items[i].borderPattern = pattern;
            items[i].setDirty();
        }
        var m = menuManager.getByName("menuAppearance");
        wbManager.redraw();
        m.refresh();
    }

    static colorChoices = ["rgb(255,255,255)", "rgb(255,255,255)", "rgb(230,230,230)","rgb(210,210,210)", "rgb(150,150,150)", "rgb(64,64,64)", "rgb(0,0,0)", "rgb(255,128,128)", "rgb(255,0,0)", "rgb(170,0,0)",
        "rgb(130,0,0)", "rgb(64,0,0)", "rgb(128,255,128)", "rgb(0,255,0)", "rgb(0,210,0)", "rgb(0,170,0)", "rgb(0,130,0)", "rgb(0,64,0)", "rgb(128,128,255)", "rgb(0,0,255)", "rgb(0,0,210)",
        "rgb(0,0,170)", "rgb(0,0,130)", "rgb(0,0,64)", "rgb(255,241,170)", "rgb(255,255,0)", "rgb(210,210,0)", "rgb(170,170,0)", "rgb(130,130,0)", "rgb(64,64,0)", "rgb(32,32,0)"];

    static backgroundOpacityChanged() {
        var m = menuManager.getByName("menuAppearance");

        var value = $("#backgroundopacityslider")[0].value;

        var items = wbManager.getSelectedItems();
        for (var i = 0; i < items.length; i++) {
            items[i].backgroundOpacity = parseInt(value)/100;
        }
        wbManager.redraw();

    }

    static shadowChanged() {
        var m = menuManager.getByName("menuAppearance");

        var value = $("#shadowslider")[0].value;

        var items = wbManager.getSelectedItems();
        for (var i = 0; i < items.length; i++) {
            items[i].shadowWidth = parseInt(value);
        }
        wbManager.redraw();

    }


    static borderThicknessChanged() {
        var m = menuManager.getByName("menuAppearance");

        var value = $("#borderthicknesslider")[0].value;

        var items = wbManager.getSelectedItems();
        for (var i = 0; i < items.length; i++) {
            items[i].borderWidth = parseInt(value) / 200 * 20;
        }
        wbManager.redraw();

    }

    constructor(name) {
        super(name); 
     
    }
    
    refresh() {
        var item = wbManager.getSelectedItems()[0];


        var html = "";
        if (item.getType() != wbItemType.wbLine) {
            html += '<div style="position:absolute;top:0px;">';
            html += '<div style="background: url(menuimages/transparent2.png) no-repeat top left;width:20px; height:20px;background-size:20px 20px;border-style:solid;border-color:white;border-width:1px"></div>';
            html += '<input id="backgroundopacityslider" oninput="menuAppearance.backgroundOpacityChanged()" style="position:absolute; top:0px; left:22px;"type="range" min="0" max="100" step="10" value="' + (item.backgroundOpacity * 100) + '" class="myslider">'
            html += '<div style="background: url(menuimages/nontransparent2.png) no-repeat top left;position:absolute;width:20px; height:20px;left:127px;top:0px;background-size:20px 20px;border-style:solid;border-color:white;border-width:1px"></div>';

            html += '<div style="position:absolute;top:20px;background: url(menuimages/noshadow.png) no-repeat top left;width:20px; height:20px;background-size:20px 20px;border-style:solid;border-color:white;border-width:1px"></div>';
            html += '<input id="shadowslider" oninput="menuAppearance.shadowChanged()" style="position:absolute; top:20px; left:22px;"type="range" min="0" max="20" step="1" value="' + (item.shadowWidth) + '" class="myslider">'
            html += '<div style="background: url(menuimages/heavyshadow.png) no-repeat top left;position:absolute;width:20px; height:20px;left:127px;top:20px;background-size:20px 20px;border-style:solid;border-color:white;border-width:1px"></div>';


            html += '<div onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuAppearance.setBorderShape(wbItemShape.rectangle)\' style="background: url(menuimages/rectangleshape.png) no-repeat top left;position:absolute;width:20px; height:20px;left:200px;top:0px;background-size:20px 20px;border-style:solid;border-color:' + ((item.getShape() == wbItemShape.rectangle) ? "black" : "white") + ';border-width:1px"></div>';
            html += '<div onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuAppearance.setBorderShape(wbItemShape.circle)\' style="background: url(menuimages/circleshape.png) no-repeat top left;position:absolute;width:20px; height:20px;left:222px;top:0px;background-size:20px 20px;border-style:solid;border-color:' + ((item.getShape() == wbItemShape.circle) ? "black" : "white") + ';border-width:1px"></div>';
            html += '<div onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuAppearance.setBorderShape(wbItemShape.roundedCornerRectangle)\' style="background: url(menuimages/roundedrectangleshape.png) no-repeat top left;position:absolute;width:20px; height:20px;left:245px;top:0px;background-size:20px 20px;border-style:solid;border-color:' + ((item.getShape() == wbItemShape.roundedCornerRectangle) ? "black" : "white") + ';border-width:1px"></div>';
            var i = 0;
            var csize = 24;

            for (var x = 0; x < 5; x++) {
                for (var y = 0; y < 10; y++) {

                    var borderColor = "white";
                    var color = item.getBackgroundColor();
                    if ((color == undefined && x == 0 && y == 0) || (color == menuAppearance.colorChoices[i] && i > 0))
                        borderColor = "black";


                    if (x == 0 && y == 0) {
                        html += '<div id="backgroundcolor_0" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuAppearance.mouseClick(this)\' style="position:absolute;top:' + ((x + 2) * (csize + 2)) + 'px;background: url(menuimages/transparent2.png) no-repeat center;width:' + (csize) + 'px; height:' + (csize - 1) + 'px;background-size:' + (csize + 4) + 'px ' + (csize + 4) + 'px;border-style:solid;border-color:' + borderColor + ';border-width:1px"></div>';

                        //                        html += '<div id="backgroundcolor_' + i + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuAppearance.mouseClick(this)\' style="position:absolute; left:' + (y * (csize + 2)) + 'px;top:' + ((x + 1) * (csize + 2)) + 'px;width:' + csize + 'px; height:' + csize + 'px;background-size:' + csize + 'px ' + csize + 'px;border-style:solid;border-color:white;border-width:1px">';
                        //                        html += '<div style="border-radius:50%;position:relative;border-width:1px; border-style:solid;background:' + menuAppearance.colorChoices[i] + ';width:' + (csize-2) + 'px; height:' + (csize-2) + 'px;background-size:' + csize + 'px ' + csize + 'px;"></div></div>';
                    }
                    else {
                        html += '<div id="backgroundcolor_' + i + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuAppearance.mouseClick(this)\' style="position:absolute; left:' + (y * (csize + 2)) + 'px;top:' + ((x + 2) * (csize + 2)) + 'px;width:' + csize + 'px; height:' + csize + 'px;background-size:' + csize + 'px ' + csize + 'px;border-style:solid;border-color:' + borderColor + ';border-width:1px">';
                        html += '<div style="border-radius:50%;position:relative;background:' + menuAppearance.colorChoices[i] + ';width:' + csize + 'px; height:' + csize + 'px;background-size:' + csize + 'px ' + csize + 'px;"></div></div>';
                    }
                    i++;
                    if (i >= menuAppearance.colorChoices.length - 1)
                        break;
                }
                if (i >= menuAppearance.colorChoices.length - 1)
                    break;
            }
            html += '</div>';

            html += '<div style="position:absolute;top:130px;width:100%">';
            html += '<hr>';

            html += '</div>';
            html += '<div style="position:absolute;top:145px;width:100%">';
        }
        else
            html += '<div style="position:absolute;top:0px;width:100%">';
        html += '<div style="background: url(menuimages/linethicknessthin.png) no-repeat top left;width:20px; height:20px;background-size:20px 20px;border-style:solid;border-color:white;border-width:1px"></div>';
        html += '<input id="borderthicknesslider" oninput="menuAppearance.borderThicknessChanged()" style="position:absolute; top:0px; left:22px;"type="range" min="0" max="200" step="10" value="' + (item.borderWidth/20 * 200) + '" class="myslider">'
        html += '<div style="background: url(menuimages/linethicknessthick.png) no-repeat top left;position:absolute;width:20px; height:20px;left:127px;top:0px;background-size:20px 20px;border-style:solid;border-color:white;border-width:1px"></div>';

        html += '<div onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuAppearance.setBorderPattern()\' style="background: url(menuimages/solidline.png) no-repeat top left;position:absolute;width:20px; height:20px;left:170px;top:0px;background-size:20px 20px;border-style:solid;border-color:' + ((item.borderPattern == undefined) ? "black" : "white") + ';border-width:1px"></div>';
        html += '<div onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuAppearance.setBorderPattern(0)\' style="background: url(menuimages/dashedline1.png) no-repeat top left;position:absolute;width:20px; height:20px;left:192px;top:0px;background-size:20px 20px;border-style:solid;border-color:' + ((item.borderPattern == 0) ? "black" : "white") + ';border-width:1px"></div>';
        html += '<div onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuAppearance.setBorderPattern(1)\' style="background: url(menuimages/dashedline2.png) no-repeat top left;position:absolute;width:20px; height:20px;left:214px;top:0px;background-size:20px 20px;border-style:solid;border-color:' + ((item.borderPattern == 1) ? "black" : "white") + ';border-width:1px"></div>';
        html += '<div onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuAppearance.setBorderPattern(2)\' style="background: url(menuimages/dashedline3.png) no-repeat top left;position:absolute;width:20px; height:20px;left:236px;top:0px;background-size:20px 20px;border-style:solid;border-color:' + ((item.borderPattern == 2) ? "black" : "white") + ';border-width:1px"></div>';


        i = 1;
        csize = 24;
        for (var x = 0; x < 5; x++) {
            for (var y = 0; y < 10; y++) {
                var borderColor = "white";
                var color = item.borderColor;
                if (color == menuAppearance.colorChoices[i])
                    borderColor = "black";

                html += '<div id="bordercolor_' + i + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuAppearance.mouseClick(this)\' style="position:absolute; left:' + (y * (csize + 2)) + 'px;top:' + ((x + 1) * (csize + 2)) + 'px;width:' + csize + 'px; height:' + csize + 'px;background-size:' + csize + 'px ' + csize + 'px;border-style:solid;border-color:' + borderColor + ';border-width:1px">';
                html += '<div style="border-radius:50%;position:relative;background:' + menuAppearance.colorChoices[i] + ';width:' + csize + 'px; height:' + csize + 'px;background-size:' + csize + 'px ' + csize + 'px;"></div></div>';
                i++;
                if (i >= menuAppearance.colorChoices.length)
                    break;
            }
            if (i >= menuAppearance.colorChoices.length)
                break;
        }
        html += '</div>';
      
        $("#" + 'wbmenu_' + this.getName()).empty();
        $("#" + 'wbmenu_' + this.getName()).append(html);    

    }

    
  
    display() {
        if (!this._active) {
            wbManager.redraw();

            var item = wbManager.getSelectedItems()[0];


            this._active = true;
            var html = ""
            var height = 250;
            if (item.getType() == wbItemType.wbLine)
                height = 106;
            html += '<div id="wbmenu_' + this.getName() + '" style="opacity:0;background-color:white;box-shadow: grey 0px 0px 10px;border-radius: 5px;border: 5px solid white;position:absolute; left:' + this._pos.x + 'px; top:' + this._pos.y + 'px ;z-index:1000000000;width:270px;height:' + height + 'px">';       
            
            html += '</div>';
            $(document.body).prepend(html);   
            this.refresh();
            var computedHeight = $("#" + "wbmenu_" + this.getName()).height();
            $("#" + "wbmenu_" + this.getName()).css({ "top": this._pos.y });


            menu.fadeIn("#wbmenu_" + this._name);
        }

    }

}
