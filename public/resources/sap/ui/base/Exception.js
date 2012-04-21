/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides a filter for list bindings
jQuery.sap.declare("sap.ui.base.Exception");

/**
 * Exception class
 * 
 * This is the base exception class. In contrary to the Error an Exception
 * should be thrown in cases, where the exception can, and should, be handled
 * within the framework, instead of causing the application to exit.
 * 
 * The try/catch statement in JavaScript can not catch specific exceptions, so 
 * when catching internal exceptions you should make sure to rethrow other errors:
 * 
 * try {
 *     ...
 * }
 * catch (oException) {
 *     if (oException instanceof sap.ui.base.Exception) {
 *         ... handle exception ...
 *     }
 *     else {
 *     	   throw oException;
 *     }
 * }
 * 
 */
sap.ui.base.Exception = function(message) {
	this.name = "Exception";
	this.message = message;
};
