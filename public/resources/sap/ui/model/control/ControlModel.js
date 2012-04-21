/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/**
 * Control-based DataBinding
 *
 * @namespace
 * @name sap.ui.model.control
 * @public
 */

// Provides the JSON object based model implementation
jQuery.sap.declare("sap.ui.model.control.ControlModel");
jQuery.sap.require("sap.ui.model.Model");
jQuery.sap.require("sap.ui.model.control.ControlPropertyBinding");
//jQuery.sap.require("sap.ui.model.control.ControlListBinding");

/**
 * Constructor for a new ControlModel.
 *
 * @class
 * Model implementation for Control model
 *
 * @extends sap.ui.model.Model
 *
 * @author SAP AG
 * @version 1.2.0
 *
 * @constructor
 */
sap.ui.model.control.ControlModel = function (oControl) {
	sap.ui.model.Model.apply(this, arguments);
	this.oControl = oControl;
	this.oControl.attachEvent("_change", this.checkUpdate, this);
	this.oElements = [];
};

//chain the prototypes
sap.ui.model.control.ControlModel.prototype = jQuery.sap.newObject(sap.ui.model.Model.prototype);

/*
 * Describe the sap.ui.model.json.JSONModel.
 * Resulting metadata can be obtained via sap.ui.model.json.JSONModel.getMetadata();
 */
sap.ui.base.Object.defineClass("sap.ui.model.control.ControlModel", {
  baseType : "sap.ui.model.Model"
});

/**
 */
sap.ui.model.control.ControlModel.prototype.destroy = function() {
	this.oControl.detachEvent("_change", this.checkUpdate, this);
};

/**
 */
sap.ui.model.control.ControlModel.prototype.addFacadeComponent = function(oElement) {
	var i=jQuery.inArray(oElement, this.oElements);
	if ( i<0 ) {
		this.oElements.push(oElement);
		oElement.attachEvent("_change", this.checkUpdate, this);
	}
};

/**
 */
sap.ui.model.control.ControlModel.prototype.removeFacadeComponent = function(oElement) {
	var i=jQuery.inArray(oElement, this.oElements);
	if ( i>= 0 ) {
		this.oElements.splice(i, 1);
		oElement.detachEvent("_change", this.checkUpdate, this);
	}
};

/**
 * @see sap.ui.model.Model.prototype.bindProperty
 */
sap.ui.model.control.ControlModel.prototype.bindProperty = function(sPath, oContext) {
	oContext = oContext || this.oControl;
	if ( oContext !== this.oControl ) {
		this.addFacadeComponent(oContext);
	}
	return new sap.ui.model.control.ControlPropertyBinding(this, sPath, oContext);
};

/**
 */
sap.ui.model.control.ControlModel.prototype.checkUpdate = function(oEvent) {
	if ( this._onchange ) {
		this._onchange(oEvent);
	}
	if ( this.aBindings.length ) {
		// TODO optimize with info from event object (control & property)
		var aBindings = this.aBindings.slice(0);
		jQuery.each(aBindings, function(iIndex, oBinding) {
			oBinding.checkUpdate();
		});
	}
};