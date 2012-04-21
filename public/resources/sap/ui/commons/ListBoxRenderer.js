/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides default renderer for control sap.ui.commons.ListBox
jQuery.sap.declare("sap.ui.commons.ListBoxRenderer");
jQuery.sap.require("sap.ui.core.Renderer");
jQuery.sap.require("jquery.sap.strings");

/**
 * @class ListBox Renderer
 *
 * @author d046011
 * @version 1.2.0
 * @static
 */
sap.ui.commons.ListBoxRenderer = {
};

/**
 * Renders the HTML for the ListBox, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRenderManager The RenderManager that can be used for writing to the render-output-buffer.
 * @param {sap.ui.commons.ListBox} oListBox The ListBox control that should be rendered.
 */
sap.ui.commons.ListBoxRenderer.render = function(oRenderManager, oListBox) {
	var rm = oRenderManager,
		r = sap.ui.commons.ListBoxRenderer;

	// TODO: this is a prototype experimenting with an alternative to onAfterRendering for size calculations and corrections
	// Do not copy this approach for now!
	// Main problem: renderers are supposed to create a string, not DOM elements, e.g. so they could also run on the server. At least that was the idea in former times.
	if (r.borderWidths === undefined) {
		if (jQuery.browser.msie) { // all known IE versions have this issue
			var oFakeLbx = document.createElement("div");
			var oStaticArea = sap.ui.getCore().getStaticAreaRef();
			oStaticArea.appendChild(oFakeLbx);
			oFakeLbx.className = "sapUiLbx";
			var $fakeLbx = jQuery(oFakeLbx);
			$fakeLbx.css("width", "50px");
			$fakeLbx.css("min-width", "100px");
			r.borderWidths = oFakeLbx.offsetWidth - 100;
			oStaticArea.removeChild(oFakeLbx);
		} else {
			// all other browsers are fine
			r.borderWidths = 0;
		}
	}


	// Return immediately if control is invisible
	if (!oListBox.getVisible()) {
		return;
	}

	rm.addClass("sapUiLbx");
	var bStd = true;
	if (!oListBox.getEditable()) {
		rm.addClass("sapUiLbxRo");
		bStd = false;
	}
	if (!oListBox.getEnabled()) {
		rm.addClass("sapUiLbxDis");
		bStd = false;
	}
	if (bStd) {
		rm.addClass("sapUiLbxStd"); // neither readonly nor disabled - this helps the CSS
	}

	// Open the containing <div> tag
	rm.write("<div");

	rm.writeControlData(oListBox);

	var width = oListBox.getWidth();
	rm.addStyle("width", width);

	if (!width || (width == "auto") || (width == "inherit")) {
		rm.addClass("sapUiLbxFlexWidth");
	}

	rm.writeClasses();

	// min/max-widths need fixes in IE
	var sMinWidth = oListBox.getMinWidth();
	var sMaxWidth = oListBox.getMaxWidth();
	if (jQuery.browser.msie) {
		sMinWidth = r.fixWidth(sMinWidth);
		sMaxWidth = r.fixWidth(sMaxWidth);
	}
	rm.addStyle("min-width", sMinWidth);
	rm.addStyle("max-width", sMaxWidth);

	var renderDummy = false;
	if (oListBox._bHeightInItems) {
		if (oListBox._sTotalHeight != null) {
			rm.addStyle("height", oListBox._sTotalHeight); // calculated height available
		} else {
			// height will be calculated and set in onAfterRendering
		}
	} else {
		rm.addStyle("height", oListBox.getHeight()); // "normal" CSS height
	}
	rm.writeStyles();

	if (sap.ui.commons.ListBox._fItemHeight == -1) {
		renderDummy = true; // render the dummy if this is the first ListBox in the document
		sap.ui.commons.ListBox._fItemHeight = -2;
	}

	var tooltip = oListBox.getTooltip_AsString();
	if (tooltip) {
		rm.writeAttributeEscaped("title", tooltip);
	}
	rm.write(">");

	this.renderItemList(oListBox, rm, renderDummy);

	rm.write("</div>");
};

/**
 * Renders all items
 */
sap.ui.commons.ListBoxRenderer.renderItemList = function (oListBox, rm, bRenderDummy) {

	// Write the start tag
	rm.write("<ul id='" + oListBox.getId() + "-list'");

	rm.writeAttribute("tabindex", this.getTabIndex(oListBox));

	// add ARIA stuff
	rm.writeAttribute("role", "listbox");
	rm.writeAccessibilityState(oListBox, {multiselectable:oListBox.getAllowMultiSelect()});
	rm.write(">");

	var items = oListBox.getItems(),
		iRealItemIndex = 0, // to not count separators
		iRealItemCount = 0;

	for (var i = 0; i < items.length; i++) { // TODO: required only for ARIA setsize
		if (!(items[i] instanceof sap.ui.core.SeparatorItem)) {
			iRealItemCount++;
		}
	}
	
	var bMarkLastChild = (jQuery.browser.msie && (jQuery.browser.version == 8 || jQuery.browser.version == 7)); // IE8 workaround for "last-cild"
	var bDisplaySecondaryValues = oListBox.getDisplaySecondaryValues();
	
	// Write the rows with the items
	for (var i = 0; i < items.length; i++) {
		var item = items[i];

		if (item instanceof sap.ui.core.SeparatorItem) {
			// draw a separator
			rm.write("<div id='", oListBox.getId(), "-I", i, "' class='sapUiLbxSep' role='separator'><hr/>");

			// colspan is not available, so add more separator cells
			if (oListBox.getDisplayIcons()) {
				rm.write("<hr/>");
			}
			if (bDisplaySecondaryValues) {
				rm.write("<hr/>");
			}
			rm.write("</div>");

		} else {
			// regular ListItem or just a plain Item
			rm.write("<li id='", oListBox.getId(), "-I", i, "'");
			// Rethink whether 'Durchnummerierung' of ListItems in the line before makes sense or could be changed and maybe incoporate the following information into the item's id.
			rm.writeAttribute("data-sap-ui-id", item.getId());

			rm.addClass("sapUiLbxI");
			if (!item.getEnabled()) {
				rm.addClass("sapUiLbxIDis");
				rm.writeAttribute("tabindex", "-1");
			}
			if (oListBox.isIndexSelected(i)) {
				rm.addClass("sapUiLbxISel");
			}
			rm.writeClasses();

			// get the text values
			var sText = item.getText();
			var sSecondaryValue = item.getAdditionalText ? item.getAdditionalText() : ""; // allow usage of sap.ui.core.Item

			// tooltip
			if (item.getTooltip_AsString()) {
				rm.writeAttributeEscaped("title", item.getTooltip_AsString());
			} else {
				rm.writeAttributeEscaped("title", sText + ((bDisplaySecondaryValues && sSecondaryValue) ? "  --  " + sSecondaryValue : ""));
			}

			// ARIA  TODO: only in accessibility case
			rm.writeAccessibilityState(item, {selected:(i===oListBox.getSelectedIndex()), setsize:iRealItemCount, posinset:iRealItemIndex+1});
			rm.writeAttribute("role", "option");

			rm.write(">");


			// write icon column if required
			if (oListBox.getDisplayIcons()) {
				rm.write("<span class='sapUiLbxIIco'><img src='");
				// if the item has an icon, use it; otherwise use something empty
				if (item.getIcon && item.getIcon()) { // allow usage of sap.ui.core.Item
					rm.writeEscaped(item.getIcon());
				} else {
					rm.write(sap.ui.resource('sap.ui.commons', 'img/1x1.gif'));
				}
				rm.write("'/></span>");
			}

			// write the main text
			rm.write("<span class='sapUiLbxITxt");
			if (bMarkLastChild && !bDisplaySecondaryValues) {
				rm.write(" sapUiLbxILastChild");
			}
			rm.write("'");
			rm.writeAttribute("id", item.getId() + "-txt");
			var oTextAlign = oListBox.getValueTextAlign();
			if(oTextAlign) {
				rm.write("style='text-align:" + sap.ui.commons.ListBoxRenderer.getTextAlign(oTextAlign, null) + "'"); // TODO: check whether the ListBox needs its own textDirection property
			}
			rm.write(">");
			if(sText === "" || sText === null) {
				rm.write("&nbsp;");
			} else {
				rm.writeEscaped(sText);
			}

			// Potentially display second column
			if (bDisplaySecondaryValues) {
				rm.write("</span><span class='sapUiLbxISec");
				if (bMarkLastChild) {
					rm.write(" sapUiLbxILastChild");
				}
				rm.write("'");
				var oTextAlign = oListBox.getSecondaryValueTextAlign();
				if(oTextAlign) {
					rm.write("style='text-align:" + sap.ui.commons.ListBoxRenderer.getTextAlign(oTextAlign, null) + "'"); // TODO: check whether the ListBox needs its own textDirection property
				}
				rm.write(">");
				rm.writeEscaped(sSecondaryValue);
			}

			rm.write("</span></li>");
			iRealItemIndex++;
		}
	}

	// In case there was no item, a dummy element might be required for height measurements
	if (bRenderDummy && (items.length == 0)) {
		rm.write("<li id=\"");
		rm.write(oListBox.getId() + "-dummyItem");
		rm.write("\" class=\"sapUiLbxI\"><span class=\"sapUiLbxITxt\">&nbsp;</span></li>");
	}

	// Close the surrounding element
	rm.write("</ul>");
};


/**
 * If the given width is set in pixels, this method reduces the pixel width by the known total width of the borders.
 * Needed for IE which doesn't handle the combination of border-box and min/max-width correctly.
 * @private
 */
sap.ui.commons.ListBoxRenderer.fixWidth = function(sCssWidth) {
	if (sap.ui.commons.ListBoxRenderer.borderWidths > 0) {
		if (sCssWidth && jQuery.sap.endsWithIgnoreCase(sCssWidth, "px")) {
			var iWidth = parseInt(sCssWidth.substr(0, sCssWidth.length - 2), 10);
			var newWidth = iWidth - sap.ui.commons.ListBoxRenderer.borderWidths;
			if (newWidth >= 0) {
				return newWidth + "px";
			}
		}
	}
	return sCssWidth;
};

/**
 * The default TabIndex that should be set for the ListBox as well as for the selected element.
 * Can be overwritten in extending sub-classes.
 * @protected
 */
sap.ui.commons.ListBoxRenderer.getTabIndex = function(oListBox) {
	if (oListBox.getEnabled() && oListBox.getEditable()) {
		return 0;
	} else {
		return -1;
	}
};

/**
 * Adapts the item CSS classes after a selection change
 * @private
 */
sap.ui.commons.ListBoxRenderer.handleSelectionChanged = function(oListBox) { // TODO: handle tab stop
	var id = oListBox.getId();

	if (oListBox.getDomRef()) {
		var items = oListBox.getItems();
		for (var i = 0, l = items.length; i < l; i++) { // TODO: could take very long for long lists
			if (oListBox.isIndexSelected(i)) {
				jQuery.sap.byId(id + "-I" + i).addClass("sapUiLbxISel").attr("aria-selected", "true");
			} else {
				jQuery.sap.byId(id + "-I" + i).removeClass("sapUiLbxISel").attr("aria-selected", "false");
			}
		}
	}
};

/**
 * Set the active descendant of the ListBox to get correct announcements
 * @private
 */
sap.ui.commons.ListBoxRenderer.handleARIAActivedescendant = function(oListBox, iIndex) {
	var oDomRef = oListBox.getDomRef();
	if (oDomRef && oDomRef.firstChild) {
		oDomRef.firstChild.setAttribute("aria-activedescendant", oListBox.getId() + "-I" + iIndex);
	}
};

/**
 * Dummy inheritance of static methods/functions.
 * @see sap.ui.core.Renderer.getTextAlign
 * @private
 */
sap.ui.commons.ListBoxRenderer.getTextAlign = sap.ui.core.Renderer.getTextAlign;
