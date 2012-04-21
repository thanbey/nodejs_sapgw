/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides default renderer for control sap.ui.commons.CheckBox
jQuery.sap.declare("sap.ui.commons.CheckBoxRenderer");
jQuery.sap.require("sap.ui.core.ValueStateSupport");

/**
 * @class
 * @author d046011
 * @version 0.1
 * @static
 */
sap.ui.commons.CheckBoxRenderer = {
};

/**
 * Renders the HTML for the CheckBox, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRenderManager The RenderManager that is used for writing to the render output buffer.
 * @param {sap.ui.commons.CheckBox} oCheckBox The CheckBox control that should be rendered.
 */
sap.ui.commons.CheckBoxRenderer.render = function(oRenderManager, oCheckBox) {
	var rm = oRenderManager;

	// Return immediately if control is invisible
	if (!oCheckBox.getVisible()) {
		return;
	}

	rm.addClass("sapUiCb");

	// Open the containing <span> tag
	rm.write("<span");
	rm.writeControlData(oCheckBox);

	// ARIA
	rm.writeAttribute("role", sap.ui.core.AccessibleRole.Checkbox.toLowerCase());
	rm.writeAccessibilityState(oCheckBox);

	// Collect state information
	var enabled = oCheckBox.getEnabled() != null && oCheckBox.getEnabled();
	var editable = oCheckBox.getEditable() != null && oCheckBox.getEditable();
	var inErrorState = false;
	var inWarningState = false;
	if (oCheckBox.getValueState() != null) {
		inErrorState = sap.ui.core.ValueState.Error == oCheckBox.getValueState();
		inWarningState = sap.ui.core.ValueState.Warning == oCheckBox.getValueState();
	}


	// Add classes and properties depending on the state
	if (oCheckBox.getChecked()) {
		rm.addClass("sapUiCbChk");
	}

	var myTabIndex = 0;
	var bReadOnly = false;

	if (!enabled) {
		bReadOnly = true;
		rm.addClass("sapUiCbDis");
		myTabIndex = -1;
	}
	if (!editable) {
		bReadOnly = true;
		rm.addClass("sapUiCbRo");
		myTabIndex = -1;
	}
	if (inErrorState) {
		rm.addClass("sapUiCbErr");
		rm.writeAttribute("aria-invalid", "true");
	} else if (inWarningState) {
		rm.addClass("sapUiCbWarn");
	}
	if (enabled && editable && !inErrorState && !inWarningState) {
		rm.addClass("sapUiCbStd");
	}
	if (enabled && editable) {
		rm.addClass("sapUiCbInteractive");
	}
	rm.writeClasses();

	if (oCheckBox.getWidth() && oCheckBox.getWidth() != '') {
		rm.writeAttribute("style", "width:" + oCheckBox.getWidth() + ";");
	}

	rm.writeAttribute("tabIndex", myTabIndex);
	
	rm.write(">"); // close the containing <span> tag


	// Write the (potentially hidden) HTML checkbox element
	rm.write("<input type='CheckBox' tabindex='-1' id='");
	rm.write(oCheckBox.getId());
	rm.write("-CB'");
	
	if (oCheckBox.getName()) {
		rm.writeAttributeEscaped('name', oCheckBox.getName());
	}

	if (oCheckBox.getChecked()) {
		rm.write(" checked='checked'");
	}
	if (!enabled) {
		rm.write(" disabled='disabled'");
	}
	var tooltip = sap.ui.core.ValueStateSupport.enrichTooltip(oCheckBox, oCheckBox.getTooltip_AsString());
	if (tooltip) {
		rm.writeAttributeEscaped("title", tooltip);
	}
	if(bReadOnly) {
		rm.write(" readOnly='readOnly'");
	}
	rm.write(" />"); // close checkbox-input-element


	// Write the checkbox label which also holds the background image
	rm.write("<label");
	if (tooltip) {
		rm.writeAttributeEscaped("title", tooltip);
	}
	rm.writeAttribute("for", oCheckBox.getId() + "-CB"); // label for checkbox, so clicks toggle the state
	if (!oCheckBox.getText()) {
		rm.write(" class='sapUiCbNoText'");
	}
	rm.write(">");
	if (oCheckBox.getText()) {
		this.renderText(rm, oCheckBox.getText(), oCheckBox.getTextDirection());
	}
	rm.write("</label>");

	// close the surrounding <span> element
	rm.write("</span>");
};



/**
 * Write the CheckBox label either flat or - in case the text direction is different from the environment - within a &lt;span&gt; tag with an explicit "dir".
 */
sap.ui.commons.CheckBoxRenderer.renderText = function(oRenderManager, sText, eTextDirection) {
	var rm = oRenderManager;
	if (!eTextDirection || eTextDirection == sap.ui.core.TextDirection.Inherit) {
		rm.writeEscaped(sText);
	} else {
		rm.write("<span dir=\"" + eTextDirection + "\">");
		rm.writeEscaped(sText);
		rm.write("</span>");
	}
};