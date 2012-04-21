/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides default renderer for control sap.ui.commons.Link
jQuery.sap.declare("sap.ui.commons.LinkRenderer");

/**
 * @class
 *
 * @author SAP - TD Core UI&AM UI Infra
 * @version 0.1
 * @static
 */
sap.ui.commons.LinkRenderer = {
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRenderManager The RenderManager that can be used for writing to the render output buffer.
 * @param {sap.ui.core.Control} oLink An object representation of the control that should be rendered.
 */
sap.ui.commons.LinkRenderer.render = function(oRenderManager, oLink) {
	var rm = oRenderManager,
		r = sap.ui.commons.LinkRenderer;

	// Return immediately if control is invisible
	if (!oLink.getVisible()) {
		return;
	}

	// Link is rendered as a "<Link>" element
	rm.write("<a");
	rm.writeControlData(oLink);

	if (!oLink.getEnabled()) {
		rm.addClass("sapUiLnkDsbl");
		rm.writeAttribute("disabled", "true");
	} else {
		rm.addClass("sapUiLnk");
	}
	rm.writeClasses();

	if (oLink.getTooltip_AsString()) {
		rm.writeAttributeEscaped("title", oLink.getTooltip_AsString());
	}

	if (oLink.getHref()) {
		rm.writeAttributeEscaped("href", oLink.getHref());
	}	else {
		rm.writeAttribute("href", "javascript:void(0);");
	}

	if (oLink.getTarget()) {
		rm.writeAttribute("target", oLink.getTarget());
	}

	if (!oLink.getEnabled()) {
		rm.writeAttribute("tabIndex", "-1");
	} else {
		rm.writeAttribute("tabIndex", "0");
	}

	// Close the starting tag
	rm.write(">");

	// Write the Link label
	if (oLink.getText()) {
		rm.writeEscaped(oLink.getText());
	}

	// Close all tags
	rm.write("</a>");

};