/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides default renderer for control sap.ui.commons.Menu
jQuery.sap.declare("sap.ui.commons.MenuRenderer");


/**
 * @class Menu renderer.
 * @author SAP - TD Core UI&AM UI Infra
 *
 * @version 1.2.0
 * @static
 */
sap.ui.commons.MenuRenderer = {
};

/**
 * Renders the HTML for the given control, using the provided
 * {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager}
 *            oRenderManager The RenderManager that can be used for writing to the render-output-buffer.
 * @param {sap.ui.core.Control}
 *            oMenu An object representation of the control that should be rendered
 */
sap.ui.commons.MenuRenderer.render = function(oRenderManager,oMenu) {
	var aItems = oMenu.getItems();
	var rm = oRenderManager;
	var colCount = 8;
	rm.write("<div tabindex=\"-1\" hideFocus=\"true\"");

	if(oMenu.getTooltip_AsString()) {
		rm.writeAttributeEscaped("title", oMenu.getTooltip_AsString());
	}

	// ARIA
	var bAccessible = sap.ui.getCore().getConfiguration().getAccessibility();
	if(bAccessible){
		rm.writeAttribute("aria-orientation", "vertical");
		rm.writeAttribute("role", "menu");

		var _getText = function(sKey, aArgs) {
			var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");
			if(rb) {
				return rb.getText(sKey, aArgs);
			}
			return sKey;
		};

		rm.writeAttribute("aria-label", oMenu.getAriaDescription() ? oMenu.getAriaDescription() : _getText("MNU_ARIA_NAME"));
		rm.writeAttribute("aria-level", oMenu.getMenuLevel());
		if(oMenu.oHoveredItem) {
			rm.writeAttribute("aria-activedescendant", oMenu.oHoveredItem.getId());
		}
	}

	rm.addClass("sapUiMnu");
	if(oMenu.getRootMenu().bUseTopStyle){
		rm.addClass("sapUiMnuTop");
	}
	rm.writeClasses();
	rm.writeControlData(oMenu);
	rm.write("><ul class=\"sapUiMnuLst");

	var bHasIcons = false;
	var bHasSubMenus = false;
	for(var idx=0; idx<aItems.length; idx++){
		if(aItems[idx].getIcon && aItems[idx].getIcon()){
			bHasIcons = true;
		}
		if(aItems[idx].getSubmenu()){
			bHasSubMenus = true;
		}
	}

	if(!bHasIcons) {
		rm.write(" sapUiMnuNoIco");
	}
	if(!bHasSubMenus) {
		rm.write(" sapUiMnuNoSbMnu");
	}

	rm.write("\">");

	var iNumberOfVisibleItems = 0;
	for (var i=0;i<aItems.length;i++) {
		if(aItems[i].getVisible() && aItems[i].render){
			iNumberOfVisibleItems++;
		}
	}

	var index = 0;
	// Menu items
	for (var i=0;i<aItems.length;i++) {
		var oItem = aItems[i];
		if(oItem.getVisible() && oItem.render){
			index++;

			if(oItem.getStartsSection()){
				rm.write("<li ");
				if(bAccessible) {
					rm.write("role=\"separator\" ");
				}
				rm.write("class=\"sapUiMnuDiv\"><div class=\"sapUiMnuDivL\"></div><hr><div class=\"sapUiMnuDivR\"></div></li>");
			}

			oItem.render(rm, oItem, oMenu, {bAccessible: bAccessible, iItemNo: index, iTotalItems: iNumberOfVisibleItems});
		}
	}

	rm.write("</ul></div>");
};