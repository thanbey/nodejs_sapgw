/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.core.FocusHandler
jQuery.sap.declare("sap.ui.core.FocusHandler");
jQuery.sap.require("sap.ui.base.Object");
jQuery.sap.require("sap.ui.Global");
jQuery.sap.require("jquery.sap.script");

(function(){

	/**
	 * Constructs an instance of a sap.ui.core.FocusHandler.
	 * Keeps track of the focused element.
	 *
	 * @class sap.ui.core.FocusHandler
	 * @param oRootRef e.g. document.body
	 */
	sap.ui.core.FocusHandler = function(oRootRef, oCore) {
		sap.ui.base.Object.apply(this);

		this.oCore = oCore;

		// keep track of element currently in focus
		this.oCurrent = null;
		// keep track of the element previously had the focus
		this.oLast = null;
		// buffer the focus/blur events for correct order
		this.aEventQueue = [];

		this.fEventHandler = jQuery.proxy(this.onEvent, this);
		this.fDestroyHandler = jQuery.proxy(this.destroy, this);

		// initialize event handling
		if(oRootRef.addEventListener && !jQuery.browser.msie){ //FF, Safari
			oRootRef.addEventListener("focus", this.fEventHandler, true);
			oRootRef.addEventListener("blur", this.fEventHandler, true);
		}else{ //IE
			jQuery(oRootRef).bind("activate", this.fEventHandler);
			jQuery(oRootRef).bind("deactivate", this.fEventHandler);
		}
		jQuery.sap.log.debug("FocusHandler setup on Root " + oRootRef.type + (oRootRef.id?": " + oRootRef.id:""), null, "sap.ui.core.FocusHandler");

		// TODO: Or should we be destroyed by the Core?
		jQuery(window).bind("unload", {"oRootRef": oRootRef}, this.fDestroyHandler);
	};

	sap.ui.core.FocusHandler.prototype = jQuery.sap.newObject(sap.ui.base.Object.prototype);
	sap.ui.base.Object.defineClass("sap.ui.core.FocusHandler", {
		baseType : "sap.ui.base.Object"
	});

	/**
	 * Returns the Id of the control/element currently in focus.
	 * @return {string} the Id of the control/element currently in focus.
	 * @public
	 */
	sap.ui.core.FocusHandler.prototype.getCurrentFocusedControlId = function(){
		return this.oCurrent;
	};

	/**
	 * Destroy method of the Focus Handler.
	 * It unregisters the event handlers.
	 *
	 * @param {jQuery.Event} event the event that initiated the destruction of the FocusHandler
	 * @private
	 */
	sap.ui.core.FocusHandler.prototype.destroy = function(event) {
		var oRootRef = event.data.oRootRef;
		if(oRootRef){
			if(oRootRef.removeEventListener && !jQuery.browser.msie){ //FF, Safari
				oRootRef.removeEventListener("focus", this.fEventHandler, true);
				oRootRef.removeEventListener("blur", this.fEventHandler, true);
			}else{ //IE
				jQuery(oRootRef).unbind("activate", this.fEventHandler);
				jQuery(oRootRef).unbind("deactivate", this.fEventHandler);
			}
		}
		jQuery(window).unbind("unload", this.fDestroyHandler);
		this.oCore = null;
	};

	/**
	 * Handles the focus/blur events.
	 *
	 * @param oRootRef e.g. document.body
	 * @private
	 */
	sap.ui.core.FocusHandler.prototype.onEvent = function(oBrowserEvent){
		var oEvent = jQuery.event.fix(oBrowserEvent);

		jQuery.sap.log.debug("Event "+oEvent.type+" reached Focus Handler (target: "+oEvent.target+(oEvent.target ? oEvent.target.id : "")+")", null, "sap.ui.core.FocusHandler");

		var type = (oEvent.type == "focus" || oEvent.type == "focusin" || oEvent.type == "activate") ? "focus" : "blur";
		this.aEventQueue.push({type:type, controlId: getControlIdForDOM(oEvent.target)});
		if(this.aEventQueue.length == 1) {
			this.processEvent();
		}
	};

	/**
	 * Processes the focus/blur events in the event queue.
	 *
	 * @private
	 */
	sap.ui.core.FocusHandler.prototype.processEvent = function(){
		var oEvent = this.aEventQueue[0];
		if(!oEvent) {
			return;
		}
		if(oEvent.type == "focus"){
			this.onfocusEvent(oEvent.controlId);
		}else if(oEvent.type == "blur"){
			this.onblurEvent(oEvent.controlId);
		}
		this.aEventQueue.shift();
		if(this.aEventQueue.length > 0) {
			this.processEvent();
		}
	};

	/**
	 * Processes the focus event taken from the event queue.
	 *
	 * @param sControlId Id of the event related control
	 * @private
	 */
	sap.ui.core.FocusHandler.prototype.onfocusEvent = function(sControlId){
		this.oCurrent = sControlId;
		triggerFocusleave(this.oLast, sControlId, this.oCore);
		this.oLast = null;
	};

	/**
	 * Processes the blur event taken from the event queue.
	 *
	 * @param sControlId Id of the event related control
	 * @private
	 */
	sap.ui.core.FocusHandler.prototype.onblurEvent = function(sControlId){
		this.oLast = sControlId;
		this.oCurrent = null;
		jQuery.sap.delayedCall(0, this, "checkForLostFocus");
	};

	/**
	 * Checks for lost focus and provides events in case of losing the focus.
	 * Called in delayed manner from {@link sap.ui.core.FocusHandler#onblurEvent}.
	 *
	 * @private
	 */
	sap.ui.core.FocusHandler.prototype.checkForLostFocus = function(){
		if(this.oCurrent == null && this.oLast != null){
			triggerFocusleave(this.oLast, null, this.oCore);
		}
		this.oLast = null;
	};


	//***********************************************************
	// Utility / convenience
	//***********************************************************

	/**
	 * Returns the id of the control/element to which the given DOM
	 * reference belongs to or <code>null</code> if no such
	 * control/element exists.
	 *
	 * @param {DOMObject} oDOM the DOM reference
	 * @private
	 */
	var getControlIdForDOM = function(oDOM){
		var sId = jQuery(oDOM).closest("[data-sap-ui]").attr("id");
		if(sId) {
			return sId;
		}
		return null;
	};

	/**
	 * Calls the onsapfocusleave function on the control with id sControlId
	 * with the information about the given related control.
	 *
	 * @param {string} sControlId
	 * @param {string} sRelatedControlId
	 * @private
	 */
	var triggerFocusleave = function(sControlId, sRelatedControlId, oCore){
		var oControl = sControlId ? sap.ui.getCore().byId(sControlId) : null;
		if(oControl){
			var oRelatedControl = sRelatedControlId ? sap.ui.getCore().byId(sRelatedControlId) : null;
			var oEvent = jQuery.Event("sapfocusleave");
			oEvent.target = oControl.getDomRef();
			oEvent.relatedControlId = oRelatedControl ? oRelatedControl.getId() : null;
			oEvent.relatedControlFocusInfo = oRelatedControl ? oRelatedControl.getFocusInfo() : null;
			//TODO: Cleanup the popup! The following is shit
			var oControlUIArea = oControl.getUIArea();
			var oUiArea = null;
			if(oControlUIArea){
				oUiArea = oCore.getUIArea(oControlUIArea.getId());
			}else{
				var oPopupUIAreaDomRef = sap.ui.getCore().getStaticAreaRef();
				if(jQuery.sap.containsOrEquals(oPopupUIAreaDomRef, oEvent.target)){
					oUiArea = oCore.getUIArea(oPopupUIAreaDomRef.id);
				}
			}
			if(oUiArea) {
				oUiArea._handleEvent(oEvent);
			}
		}
	};

	/**
	 * Checks if the passed DOM reference is nested in the active DOM of the document
	 * @param {DOMNode} oDomRef The new active element
	 * @private
	 * @type boolean
	 * @returns whether the passed DOM reference is nested in the active DOM of the document
	 */
	/*function isInActiveDom(oDomRef) {
		jQuery.sap.assert(oDomRef != null);
		var oCurrDomRef = oDomRef;
		while(oCurrDomRef) {
			if(oCurrDomRef === document) return true;
			oCurrDomRef = oCurrDomRef.parentNode;
		}
		return false;
	};*/

}());