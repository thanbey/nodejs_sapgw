/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides default renderer for the sap.ui.ux3.OverlayContainer
jQuery.sap.declare("sap.ui.ux3.OverlayContainerRenderer");
jQuery.sap.require("sap.ui.ux3.OverlayRenderer");
jQuery.sap.require("sap.ui.core.Renderer");
/**
 * @class OverlayContainer renderer.
 * @static
 */
sap.ui.ux3.OverlayContainerRenderer = sap.ui.core.Renderer.extend(sap.ui.ux3.OverlayRenderer)

/**
 * Renders the Overlay content
 *
 * @param {sap.ui.core.RenderManager}
 *            oRenderManager the RenderManager that can be used for writing to
 *            the Render-Output-Buffer
 * @param {sap.ui.core.Control}
 *            oControl an object representation of the control that should be
 *            rendered
 */;
sap.ui.ux3.OverlayContainerRenderer.renderContent = function(oRenderManager, oControl) {
	var rm = oRenderManager;
	rm.write("<div role='Main' class='sapUiUx3OCContent'>");
	var content = oControl.getContent();
	for (var i = 0; i < content.length; i++) {
		var control = content[i];
		rm.renderControl(control);
	}
	rm.write("</div>");
}
/**
 * Add root class to Overlay
 *
 * @param {sap.ui.core.RenderManager}
 *            oRenderManager the RenderManager that can be used for writing to
 *            the Render-Output-Buffer
 * @param {sap.ui.core.Control}
 *            oControl an object representation of the control that should be
 *            rendered
 */;
sap.ui.ux3.OverlayContainerRenderer.addRootClasses = function(oRenderManager, oControl) {
	var rm = oRenderManager;
	rm.addClass("sapUiUx3OC");
}
/**
 * Add class to Overlay
 *
 * @param {sap.ui.core.RenderManager}
 *            oRenderManager the RenderManager that can be used for writing to
 *            the Render-Output-Buffer
 * @param {sap.ui.core.Control}
 *            oControl an object representation of the control that should be
 *            rendered
 */;
sap.ui.ux3.OverlayContainerRenderer.addOverlayClasses = function(oRenderManager, oControl) {
	var rm = oRenderManager;
	rm.addClass("sapUiUx3OCOverlay");
}