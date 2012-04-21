/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides a filter for list bindings
jQuery.sap.declare("sap.ui.model.ValidateException");
jQuery.sap.require("sap.ui.base.Exception");

/**
 * ValidateException class
 * 
 * This exception is thrown, when a validation error occurs while checking the
 * defined constraints for a type.
 */
sap.ui.model.ValidateException = function(message, violatedConstraints) {
	this.name = "ValidateException";
	this.message = message;
	this.violatedConstraints = violatedConstraints;
};
sap.ui.model.ValidateException.prototype = jQuery.sap.newObject(sap.ui.base.Exception.prototype);
