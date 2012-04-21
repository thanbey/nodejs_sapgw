/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides default renderer for the sap.ui.ux3.Feeder
jQuery.sap.declare("sap.ui.ux3.FeederRenderer");

/**
 * @class Feeder renderer. 
 * @static
 */
sap.ui.ux3.FeederRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.ui.ux3.FeederRenderer.render = function(oRenderManager, oControl){ 
    // convenience variable
	var rm = oRenderManager;
	var oFeeder = oControl;
	
	// write the HTML into the render manager  
    rm.write('<DIV');
    rm.writeControlData(oFeeder);
	rm.addClass('sapUiFeeder');
	
	switch (oFeeder.getType()){ 
	case( sap.ui.ux3.FeederType.Medium):
		rm.addClass('sapUiFeederMedium');
	break;
	case( sap.ui.ux3.FeederType.Comment):
		rm.addClass('sapUiFeederComment');
	break;
	default: // large feeder is default
		rm.addClass('sapUiFeederLarge');
	break;
	}
	
	rm.writeClasses();
    rm.write('>'); 

    // thumbnail
	rm.write('<img id=' + oFeeder.getId() + '-thumb');
	var sThumbnail = oFeeder.getThumbnailSrc();
	if(!sThumbnail){
		sThumbnail = jQuery.sap.getModulePath("sap.ui.ux3", '/') + "themes/" + sap.ui.getCore().getConfiguration().getTheme() + sap.ui.core.theming.Parameters.get('sap.ui.ux3:sapUiFeedPersonPlaceholder');
	}
	rm.writeAttributeEscaped('src', sThumbnail);

//	rm.writeAttributeEscaped('alt', oChunk.getSender());
	rm.writeClasses();
	rm.write('>');
	
	// input area as editable DIV because of dynamic content
    rm.write('<DIV id=' + oFeeder.getId() + '-input contenteditable="true" class="sapUiFeederInput" >');

    // text
    if(oFeeder.getText() == ''){
    	rm.write(this.getEmptyTextInfo( oFeeder ));
    }else{
		rm.write(jQuery.sap.escapeHTML(oFeeder.getText()).replace(/(\r\n)|(\n\r)|\r|\n/g,"<br />"));
    }
	
    rm.write('</DIV>');
    
    //send button
    oFeeder.initSendButton();
    rm.renderControl(oFeeder.oSendButton);								
    
    rm.write('</DIV>');
};

sap.ui.ux3.FeederRenderer.getEmptyTextInfo = function( oFeeder ){

	return "<span class='sapUiFeederEmptyText'>" + oFeeder.rb.getText("FEED_EMPTY_FEEDER")+ "</span>";

};
