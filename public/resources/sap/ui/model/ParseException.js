/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides a filter for list bindings
jQuery.sap.declare("sap.ui.model.ParseException");
jQuery.sap.require("sap.ui.base.Exception");

/**
 * ParseException class
 * 
 * This exception is thrown, when a parse error occurs while converting a
 * string value to a specific property type in the model.
 */
sap.ui.model.ParseException = function(message) {
	this.name = "ParseException";
	this.message = message;
};
sap.ui.model.ParseException.prototype = jQuery.sap.newObject(sap.ui.base.Exception.prototype);