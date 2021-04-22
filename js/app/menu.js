const menuOrientation = {
    vertical: 0,
    horizontal: 1,
    box:2
};



class menu {


    static menuidCounter = 0;

    static fadeIn(div) {
        setTimeout(function () {
            var op = parseFloat($(div).css("opacity"));
            op += 0.05;
            $(div).css({ "opacity": op })
            if (op < 1.0)
                menu.fadeIn(div);           
        }, 10);
    }

    constructor(name) {
        this._name = name;
        this._orientation = menuOrientation.vertical;
        this._items = [];
        this._pos = new Communicator.Point2(0, 0);
        this.active = false;
        this._box_x = 0;
        this._box_y = 0;
        this._imageSizeX = 32;
        this._imageSizeY = 32;
        this.parent = undefined;
        this.action = undefined;

    }

    getItemByName(itemname) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].name == itemname) {
                return this._items[i];
            }
        }
    }

    addItem(name, imagename, action, extraData, istoggle, submenu, title) {
        var item = new menuItem(name, imagename, action, extraData, istoggle, submenu, title);
        this._items.push(item);
        return item;
    }

    setPosition(x, y) {
        this._pos.x = x;
        this._pos.y = y;
    }

    getParentItem() {
        if (this.parent != undefined) {
            return this.parent.parentitem;
        }
        else
            return undefined;
    }
    getParentMenu() {
        if (this.parent != undefined) {
            return this.parent.parentmenu;
        }
        else
            return undefined;
    }

    setAction(action) {
        this.action = action;
    }

    getAction() {
        return this.action;
    }

    setBoxDimensions(x, y) {
        this._box_x = x;
        this._box_y = y;
    }


    setOrientation(orientation) {
        this._orientation = orientation;
    }

    getName() {
        return this._name;
    }

    getOrientation() {
        return this._orientation;
    }

    setImageSize(x, y) {
        this._imageSizeX = x;
        this._imageSizeY = y;
    }


    display(isSubmenu) {
        if (!this._active) {
            this._active = true;
            var html = ""

            if (this._orientation == menuOrientation.horizontal || this._orientation == menuOrientation.vertical) {
                var orientation = ""
                if (this._orientation == menuOrientation.horizontal)
                    orientation = "display:inline-flex;"

                html += '<div id="wbmenu_' + this._name + '" style="' + orientation + 'opacity:0;background-color:white;box-shadow: grey 0px 0px 10px;border-radius: 5px;border: 5px solid white;position:absolute; left:' + this._pos.x + 'px; top:' + this._pos.y + 'px ;z-index:1000000001">';
                for (var i = 0; i < this._items.length; i++) {
                    html = this._items[i].createDiv(html,this);
                }

                html += '</div>';
                $(document.body).prepend(html);
                if (isSubmenu == undefined) {
                    if (this._orientation == menuOrientation.vertical) {
                        var computedHeight = $("#" + "wbmenu_" + this._name).height();
                        $("#" + "wbmenu_" + this._name).css({ "top": this._pos.y - computedHeight / 2 });
                    }
                    else {
                        var computedWidth = $("#" + "wbmenu_" + this._name).width();
                        $("#" + "wbmenu_" + this._name).css({ "left": this._pos.x - computedWidth / 2 });

                    }
                }
            }
            else {
                orientation = "display:inline-flex;"
                html += '<div id="wbmenu_' + this._name + '" style="' + orientation + 'opacity:0;background-color:white; box-shadow: grey 0px 0px 10px;border-radius: 5px;border: 5px solid white;position:absolute; left:' + this._pos.x + 'px; top:' + this._pos.y + 'px ;z-index:1000000001">';
                var i = 0;
                for (var y = 0; y < this._box_y; y++) {
                    html += '<div>';
                    for (var x = 0; x < this._box_x; x++) {
                        if (i >= this._items.length)
                            break;
                        html = this._items[i].createDiv(html, this);
                        i++
                    }
                    html += '</div>';
                    if (i >= this._items.length)
                        break;
                }
                html += '</div>';
                $(document.body).prepend(html);
            }
            this._updateToggled();
            var _this = this;

            menu.fadeIn("#wbmenu_" + this._name);          

        }

    }

    _updateToggled() {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i]._toggled)
                $("#" + this._name + "_" + this._items[i].name).css({ "border-color": "black" })
            else
                $("#" + this._name + "_" + this._items[i].name).css({ "border-color": "white" })
        }
    }

    _hideSubmenus() {

        for (var i = 0; i < this._items.length; i++)
            if (this._items[i].submenu != undefined) {
                this._items[i].submenu.hide();
                this._items[i].submenu._hideSubmenus();
                this._items[i]._toggled = false;
            }
    }
    hide(collapseUp) {
        if (this._active) {
            this._active = false;
            _this = this;
//            $("#wbmenu-" + this._name).fadeOut(300, "swing", function () {
                $("#wbmenu_" + _this._name).remove();
//            });
//            $("#wbmenu-" + this._name).remove();
        }
        this._hideSubmenus();
        if (collapseUp != undefined) {
            if (this.parent != undefined) {
                var p = this.parent.parentmenu;
                var c = this;
                while (p != undefined) {
                    p._updateToggled();
                    for (var i = 0; i < p._items.length; i++) {
                        if (p._items[i].submenu != undefined && p._items[i].submenu._name == c._name) {
                            p._items[i]._toggled = false;
                            p._updateToggled();
                            if (p.parent != undefined)
                                p.hide();
                        }
                    }
                    if (p.parent == undefined)
                        break;
                    c = p;
                    p = p.parent.parentmenu;
                }
            }
        }
    }
    

    setParent(parentmenu, parentitem) {
        this.parent = { parentmenu: parentmenu, parentitem: parentitem };
    }

    

}