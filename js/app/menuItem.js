class menuItem {

    static mouseEnter(x) {
        $(x).css({ "background-color": "rgba(200,200,255,.5)", "background-blend-mode": "multiply" })
    }
    static mouseLeave(x) {
        $(x).css({ "background-color": "", "background-blend-mode": "" })
    }

    static mouseClick(x) {
        var id = x.id.split("_");
        var m = menuManager.getByName(id[0]);
        if (m != undefined) {
            var item = m.getItemByName(id[1]);

            if (item.isToggle == true) {
                item._toggled = !item._toggled;
                if (item._toggled)
                    $(x).css({ "border-color": "black" })
                else
                    $(x).css({ "border-color": "white" })

                if (item.submenu != undefined) {
                    if (item._toggled) {
                        m._hideSubmenus();
                        item._toggled = true;
                        m._updateToggled();

                        var offset = $(x).offset()
                        item.submenu.setParent(m, item);
                        if (m.getOrientation() == menuOrientation.vertical) {
                            item.submenu.setPosition(offset.left + 50, offset.top);
                            item.submenu.display(true);
                        }
                        else {
                            item.submenu.setPosition(offset.left, offset.top + 50);
                            item.submenu.display(true);
                        }
                    }
                    else
                        item.submenu.hide();
                }

            }
            if (item.submenu == undefined) {
                if (item.action != undefined)
                    item.action(item, m.getParentItem(), m.getParentMenu());
                else if (m.getAction() != undefined)
                    m.getAction()(item, m.getParentItem(), m.getParentMenu());
                else if (m.getParentItem() != undefined && m.getParentItem().action != undefined)
                    m.getParentItem().action(item, m.getParentItem(), m.getParentMenu());
                else if (m.getParentMenu() != undefined && m.getParentMenu().getAction() != undefined)
                    m.getParentMenu().getAction()(item, m.getParentItem(), m.getParentMenu());

            }
            if (!item.isToggle && m.parent != undefined)
                m.hide(true);
        }

    }


    constructor(name, imagename, action, extraData, istoggle, submenu,title) {
        this.name = name;
        this.imagename = imagename;
        this.action = action;
        this.extraData = extraData;
        if (istoggle != undefined)
            this.isToggle = istoggle;
        else
            this.isToggle = false;
        this.submenu = submenu;
        this._toggled = false;
        this._title = title;
        this.hidden = false;
    }

    isToggled() {
        return this._toggled;
    }

    setToggled(onoff) {
        this._toggled = onoff;
    }
    getTitle() {
        if (this._title != undefined) {
            return this._title;
        }
        else
            return this.name;
    }

    setImage(imagename, menu) {
        this.imagename = imagename;
        $("#" + menu.getName() + "_" + this.name).css("background-image", 'url(menuimages/' + imagename + ')');
    }

    createDiv(html, menu) {
        if (!this.hidden) {
            if (this.imagename.indexOf("rgb") > -1) {
                html += '<div title="' + this.getTitle() + '" id="' + menu.getName() + "_" + this.name + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuItem.mouseClick(this)\' style="width:' + menu._imageSizeX + 'px; height:' + menu._imageSizeY + 'px;background-size:' + menu._imageSizeX + 'px ' + menu._imageSizeY + 'px;border-style:solid;border-color:white;border-width:1px">';
                html += '<div style="border-radius:50%;top:5px;left:5px;position:relative;background:' + this.imagename + ';width:' + (menu._imageSizeX - 10) + 'px; height:' + (menu._imageSizeY - 10) + 'px;background-size:' + (menu._imageSizeX - 10) + 'px ' + (menu._imageSizeY - 10) + 'px;"></div></div>';

            }
            else
                html += '<div title="' + this.getTitle() + '" id="' + menu.getName() + "_" + this.name + '" onmouseenter=\'menuItem.mouseEnter(this)\' onmouseleave=\'menuItem.mouseLeave(this)\' onclick=\'menuItem.mouseClick(this)\' style="background: url(menuimages/' + this.imagename + ') no-repeat top left;width:' + menu._imageSizeX + 'px; height:' + menu._imageSizeY + 'px;background-size:' + menu._imageSizeX + 'px ' + menu._imageSizeY + 'px;border-style:solid;border-color:white;border-width:1px"></div>';
        }
        return html;
    }                       
}
   