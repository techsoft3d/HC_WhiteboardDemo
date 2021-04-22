class menuTextSize extends menu {

    static mouseClick(x) {
        var id = x.id.split("-");
        var m = menuManager.getByName(id[0]);
        m.action(id[0], id[1]);
        m.hide(true);
    }


    constructor(name) {
        super(name);       
        this.action = menuTextFont.setEditorTextStyles;
    }

    display() {
        if (!this._active) {
            this._active = true;
            var html = ""


            html += '<div id="wbmenu_' + this.getName() + '" style="opacity:0;background-color:white;box-shadow: grey 0px 0px 10px;border-radius: 5px;border: 5px solid white;position:absolute; left:' + this._pos.x + 'px; top:' + this._pos.y + 'px ;z-index:1000000001">';
            html += '<div id="' + this.getName() + "-" + "5" + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuTextSize.mouseClick(this)\' style="border-color:white;border-width:1px">5px</div>';        
            html += '<div id="' + this.getName() + "-" + "10" + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuTextSize.mouseClick(this)\' style="border-color:white;border-width:1px">10px</div>';        
            html += '<div id="' + this.getName() + "-" + "20" + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuTextSize.mouseClick(this)\' style="border-color:white;border-width:1px">20px</div>';        
            html += '<div id="' + this.getName() + "-" + "30" + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuTextSize.mouseClick(this)\' style="border-color:white;border-width:1px">30px</div>';        
            html += '<div id="' + this.getName() + "-" + "40" + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuTextSize.mouseClick(this)\' style="border-color:white;border-width:1px">40px</div>';        
            html += '<div id="' + this.getName() + "-" + "50" + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuTextSize.mouseClick(this)\' style="border-color:white;border-width:1px">50px</div>';        
            html += '<div id="' + this.getName() + "-" + "100" + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuTextSize.mouseClick(this)\' style="border-color:white;border-width:1px">100px</div>';        

            html += '</div>';
            $(document.body).prepend(html);
            var computedHeight = $("#" + "wbmenu_" + this.getName()).height();
            $("#" + "wbmenu_" + this.getName()).css({ "top": this._pos.y});
           

            menu.fadeIn("#wbmenu_" + this._name);
        }

    }

}

class menuTextFont extends menu {

    static mouseClick(x) {
        var id = x.id.split("-");
        var m = menuManager.getByName(id[0]);
        m.action(id[0], id[1]);
        m.hide(true);
    }


    static setEditorTextStyles(type, value) {
        var range = exampleEditor.selectedRange();
        range.setFormatting(type, value);

    }

    constructor(name) {
        super(name);
        this.action = menuTextFont.setEditorTextStyles;
    }

    display() {
        if (!this._active) {
            this._active = true;
            var html = ""


            html += '<div id="wbmenu_' + this.getName() + '" style="opacity:0;background-color:white;box-shadow: grey 0px 0px 10px;border-radius: 5px;border: 5px solid white;position:absolute; left:' + this._pos.x + 'px; top:' + this._pos.y + 'px ;z-index:1000000001">';
            html += '<div id="' + this.getName() + "-" + "Arial" + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuTextFont.mouseClick(this)\' style="border-color:white;border-width:1px;font-family: Arial">Arial</div>';
            html += '<div id="' + this.getName() + "-" + "Verdana" + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuTextFont.mouseClick(this)\' style="border-color:white;border-width:1px;font-family: Verdana">Verdana</div>';
            html += '<div id="' + this.getName() + "-" + "Fantasy" + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuTextFont.mouseClick(this)\' style="border-color:white;border-width:1px;font-family: Fantasy">Fantasy</div>';
            html += '<div id="' + this.getName() + "-" + "Monospace" + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuTextFont.mouseClick(this)\' style="border-color:white;border-width:1px;font-family: Monospace">Monospace</div>';

            html += '</div>';
            $(document.body).prepend(html);
            var computedHeight = $("#" + "wbmenu_" + this.getName()).height();
            $("#" + "wbmenu_" + this.getName()).css({ "top": this._pos.y});


            menu.fadeIn("#wbmenu_" + this._name);
        }

    }

}
   