/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/**
 * JSON-based DataBinding
 *
 * @namespace
 * @name sap.ui.model.json
 * @public
 */

// Provides the JSON object based model implementation
jQuery.sap.declare("sap.ui.model.json.JSONModel");
jQuery.sap.require("sap.ui.model.Model");
jQuery.sap.require("sap.ui.model.json.JSONPropertyBinding");
jQuery.sap.require("sap.ui.model.json.JSONListBinding");
jQuery.sap.require("sap.ui.model.json.JSONTreeBinding");

/**
 * Constructor for a new JSONModel.
 *
 * @class
 * Model implementation for JSON format
 *
 * @extends sap.ui.model.Model
 *
 * @author SAP AG
 * @version 1.2.0
 *
 * @param {object} oData either the URL where to load the JSON from or a JS object
 * @constructor
 * @public
 */
sap.ui.model.json.JSONModel = function(oData) {
	sap.ui.model.Model.apply(this, arguments);
	if (typeof oData == "string"){
		this.loadData(oData);
	}
	else if (oData && typeof oData == "object"){
		this.setData(oData);
	}
};

// chain the prototypes
sap.ui.model.json.JSONModel.prototype = jQuery.sap.newObject(sap.ui.model.Model.prototype);

/*
 * Describe the sap.ui.model.json.JSONModel.
 * Resulting metadata can be obtained via sap.ui.model.json.JSONModel.getMetadata();
 */
sap.ui.base.Object.defineClass("sap.ui.model.json.JSONModel", {

  // ---- object ----
  baseType : "sap.ui.model.Model",
  publicMethods : ["loadData", "setData", "getData", "setJSON", "getJSON"]
});

/**
 * Sets the JSON encoded data to the model.
 *
 * @param {object} oData the data to set on the model
 * @param {boolean} [bMerge=false] whether to merge the data instead of replacing it
 *
 * @public
 */
sap.ui.model.json.JSONModel.prototype.setData = function(oData, bMerge){
	if (bMerge) {
		// do a deep copy
		this.oData = jQuery.extend(true, {}, this.oData, oData);
	} else {
		this.oData = oData;
	}
	this.checkUpdate();
};

/**
 * Returns the current JSON data of the model. 
 * Be aware that the returned object is a reference to the model data so all changes to that data will also change the model data.
 *
 * @return the JSON data object
 * @public
 */
sap.ui.model.json.JSONModel.prototype.getData = function(){
	return this.oData;
};

/**
 * Sets the JSON encoded string data to the model.
 *
 * @param {string} sJSONText the string data to set on the model
 * @param {boolean} [bMerge=false] whether to merge the data instead of replacing it
 *
 * @public
 */
sap.ui.model.json.JSONModel.prototype.setJSON = function(sJSONText, bMerge){
	var oJSONData;
	try {
		oJSONData = jQuery.parseJSON(sJSONText);		
		this.setData(oJSONData, bMerge);
	} catch (e) {
		jQuery.sap.log.fatal("The following problem occurred: JSON parse Error: " + e);
		this.fireParseError({url : "", errorCode : -1,
			reason : "", srcText : e, line : -1, linepos : -1, filepos : -1});
	}
};

/**
 * Serializes the current JSON data of the model into a string. 
 *
 * @return the JSON data serialized as string 
 * @public
 */
sap.ui.model.json.JSONModel.prototype.getJSON = function(){
	return JSON.stringify(this.oData);
};

/**
 * Load JSON-encoded data from the server using a GET HTTP request and store the resulting JSON data in the model.
 * Note: Due to browser security restrictions, most "Ajax" requests are subject to the same origin policy,
 * the request can not successfully retrieve data from a different domain, subdomain, or protocol.
 *
 * @param {string} sURL A string containing the URL to which the request is sent.
 * @param {object | string}[oParameters] A map or string that is sent to the server with the request.
 * Data that is sent to the server is appended to the URL as a query string.
 * If the value of the data parameter is an object (map), it is converted to a string and
 * url-encoded before it is appended to the URL.
 * @param {boolean} [async=true] By default, all requests are sent asynchronous
 * (i.e. this is set to true by default). If you need synchronous requests, set this option to false.
 * Cross-domain requests do not support synchronous operation. Note that synchronous requests may
 * temporarily lock the browser, disabling any actions while the request is active.
 * @param {string} [sType=GET] The type of request to make ("POST" or "GET"), default is "GET".
 * Note: Other HTTP request methods, such as PUT and DELETE, can also be used here, but
 * they are not supported by all browsers.
 * @param {boolean} [bMerge=false] whether the data should be merged instead of replaced
 *
 * @public
 */
sap.ui.model.json.JSONModel.prototype.loadData = function(sURL, oParameters, bAsync, sType, bMerge){
	var that = this;
	if (bAsync !== false) {
		bAsync = true;
	}
	if (!sType)	{
		sType = "GET";
	}
	this.fireRequestSent({url : sURL, type : sType, async : bAsync, info : "cache=false;bMerge=" + bMerge});
	jQuery.ajax({
	  url: sURL,
	  async: bAsync,
	  dataType: 'json',
	  cache: false,
	  data: oParameters,
	  type: sType,
	  success: function(oData) {
		if (!oData) {
			jQuery.sap.log.fatal("The following problem occurred: No data was retrieved by service: " + sURL);
		}
		that.setData(oData, bMerge);
		that.fireRequestCompleted({url : sURL, type : sType, async : bAsync, info : "cache=false;bMerge=" + bMerge});
	  },
	  error: function(XMLHttpRequest, textStatus, errorThrown){
		jQuery.sap.log.fatal("The following problem occurred: " + textStatus, XMLHttpRequest.responseText + ","
					+ XMLHttpRequest.status + "," + XMLHttpRequest.statusText);
		that.fireRequestCompleted({url : sURL, type : sType, async : bAsync, info : "cache=false;bMerge=" + bMerge});
		that.fireRequestFailed({message : textStatus,
			statusCode : XMLHttpRequest.status, statusText : XMLHttpRequest.statusText, responseText : XMLHttpRequest.responseText});
	  }
	});
};

/**
 * Private method iterating the registered bindings of this model instance and initiating their check for update
 * @param {object} oUpdateInfo
 * @param {string} oUpdateInfo.path
 *
 * @private
 */
sap.ui.model.json.JSONModel.prototype.checkUpdate = function() {
	var aBindings = this.aBindings.slice(0);
	jQuery.each(aBindings, function(iIndex, oBinding) {
		oBinding.checkUpdate();
	});
};


/**
 * @see sap.ui.model.Model.prototype.bindProperty
 *
 */
sap.ui.model.json.JSONModel.prototype.bindProperty = function(sPath, oContext) {
	var oBinding = new sap.ui.model.json.JSONPropertyBinding(this, sPath, oContext);
	return oBinding;
};

/**
 * @see sap.ui.model.Model.prototype.bindList
 *
 */
sap.ui.model.json.JSONModel.prototype.bindList = function(sPath, oContext, oSorter, aFilters) {
	var oBinding = new sap.ui.model.json.JSONListBinding(this, sPath, oContext, oSorter, aFilters);
	return oBinding;
};

/**
 * @see sap.ui.model.Model.prototype.bindTree
 *
 */
sap.ui.model.json.JSONModel.prototype.bindTree = function(sPath, oContext) {
	var oBinding = new sap.ui.model.json.JSONTreeBinding(this, sPath, oContext);
	return oBinding;
};

/**
 * @see sap.ui.model.Model.prototype.createBindingContext
 *
 */
sap.ui.model.json.JSONModel.prototype.createBindingContext = function(sPath, oContext, fCallBack) {
	if (!oContext){
		oContext = "";
	}
	if (!jQuery.sap.startsWith(sPath, "/")) {
		sPath = oContext + "/" + sPath;
	}
	fCallBack(sPath);
};

/**
 * @see sap.ui.model.Model.prototype.destroyBindingContext
 *
 */
sap.ui.model.json.JSONModel.prototype.destroyBindingContext = function(oContext) {
	// TODO: what todo here?
};

/**
 * Sets a new value for the given property <code>sPropertyName</code> in the model. 
 * If the model value changed all interested parties are informed.
 *
 * @param {string}  sPath path of the property to set
 * @param {any}     oValue value to set the property to
 * @param {object} [oContext=null] the context which will be used to set the property
 * @public
 */
sap.ui.model.json.JSONModel.prototype.setProperty = function(sPath, oValue, oContext) {
	var sObjectPath = sPath.substring(0, sPath.lastIndexOf("/")),
		sProperty = sPath.substr(sPath.lastIndexOf("/")+1);
	var oObject = this._getObject(sObjectPath, oContext);
	oObject[sProperty] = oValue;

	this.checkUpdate();
};

/**
* Returns the value for the property with the given <code>sPropertyName</code>
*
* @param {string} sPath the path to the property
* @param {object} [oContext=null] the context which will be used to retrieve the property
* @type any
* @return the value of the property
* @public
*/
sap.ui.model.json.JSONModel.prototype.getProperty = function(sPath, oContext) {
	return this._getObject(sPath, oContext);

};

/**
 * @param sPath
 * @param oContext
 * @returns the node of the specified path/context
 */
sap.ui.model.json.JSONModel.prototype._getObject = function (sPath, oContext) {
	var oNode = this.oData;
	if (typeof oContext == "string"){
		oNode = this._getObject(oContext);
		if (!oNode) {
			return null;
		}
	}
	else if (oContext){
		oNode = oContext;
	}
	if (!sPath) {
		return oNode;
	}
	var aParts = sPath.split("/"),
		iIndex = 0;
	if (!aParts[0]) {
		// absolute path starting with slash
		oNode = this.oData;
		iIndex++;
	}
	while(oNode && aParts[iIndex]) {
		oNode = oNode[aParts[iIndex]];
		iIndex++;
	}
	return oNode;
};