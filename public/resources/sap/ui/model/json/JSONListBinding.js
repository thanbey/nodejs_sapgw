/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the JSON model implementation of a list binding
jQuery.sap.declare("sap.ui.model.json.JSONListBinding");
jQuery.sap.require("sap.ui.model.ListBinding");


/**
 *
 * @class
 * List binding implementation for JSON format
 *
 * @param sPath
 * @param [oModel]
 */
sap.ui.model.json.JSONListBinding = function(oModel, sPath, oContext, oSorter, aFilters){
	sap.ui.model.ListBinding.apply(this, arguments);
	this.oSorter = oSorter;
	this.aFilters = aFilters;
	this.update();
};
sap.ui.model.json.JSONListBinding.prototype = jQuery.sap.newObject(sap.ui.model.ListBinding.prototype);

sap.ui.base.Object.defineClass("sap.ui.model.json.JSONListBinding", {

  // ---- object ----
  baseType : "sap.ui.model.ListBinding",
  publicMethods : [
	// methods
	"getLength"
  ]

});

/**
 * Return contexts for the list or a specified subset of contexts
 * @param {int} [iStartIndex=0] the startIndex where to start the retrieval of contexts 
 * @param {int} [iLength=length of the list] determines how many contexts to retrieve beginning from the start index. 
 * Default is the whole list length. 
 *
 * @return {Array} the contexts array
 * @protected
 */
sap.ui.model.json.JSONListBinding.prototype.getContexts = function(iStartIndex, iLength) {
	if (!iStartIndex) {
		iStartIndex = 0;
	}
	if (!iLength) {
		iLength = Math.min(this.iLength, 100);
	}
	
	var iEndIndex = Math.min(iStartIndex + iLength, this.aIndices.length);

	function slash(s) { return s.slice(-1) !== "/" ? s + "/" : s; }
	var aContexts = [],
		// if the path is not absolute, the prefix starts with the context. It always ends with the (potentially empty) path
		sPrefix = slash((this.sPath.indexOf("/") !== 0 ? slash(this.oContext || "") : "") + this.sPath);
	for (var i = iStartIndex; i < iEndIndex; i++) {
		aContexts.push(sPrefix + this.aIndices[i]);	
	}
	return aContexts;
};

/**
 * Setter for context
 * @param {Object} oContext the new context object
 */
sap.ui.model.json.JSONListBinding.prototype.setContext = function(oContext) {
	if (this.oContext != oContext) {
		this.oContext = oContext;
		this.update();
		this._fireChange();
	}
};

/**
 * Return the length of the list
 *
 * @return {int} the length
 * @protected
 */
sap.ui.model.json.JSONListBinding.prototype.getLength = function() {
	return this.iLength;
};

/**
 * Return the length of the list
 *
 * @return {int} the length
 */
sap.ui.model.json.JSONListBinding.prototype._getLength = function() {
	return this.aIndices.length;
};


/**
 * Update the list, indices array and apply sorting and filtering
 * @private
 */
sap.ui.model.json.JSONListBinding.prototype.update = function(){
	var oList = this.oModel._getObject(this.sPath, this.oContext);
	if (oList && jQuery.isArray(oList)) {
		this.oList = oList.slice(0);
		this.updateIndices();
		this.applyFilter();
		this.applySort();
		this.iLength = this._getLength();
	}
	else {
		this.oList = null;
		this.aIndices = [];
		this.iLength = 0;
	}
};

/**
 * Check whether this Binding would provide new values and in case it changed,
 * inform interested parties about this.
 */
sap.ui.model.json.JSONListBinding.prototype.checkUpdate = function(){
	var oList = this.oModel._getObject(this.sPath, this.oContext);
	if (!this.oList || !oList || oList.length != this.oList.length) {
		this.update();
		this._fireChange();
	}
};

/**
 * Get indices of the list
 */
sap.ui.model.json.JSONListBinding.prototype.updateIndices = function(){
	this.aIndices = [];
	for (var i = 0; i < this.oList.length; i++) {
		this.aIndices.push(i);
	}

};

/**
 * @see sap.ui.model.ListBinding.prototype.sort
 *
 */
sap.ui.model.json.JSONListBinding.prototype.sort = function(oSorter){
	if (!oSorter) {
		this.oSorter = null;
		this.updateIndices();
		this.applyFilter();
	} else {
		this.oSorter = oSorter;
		this.applySort();
	}
	this._fireChange();
	this._fireSort({sorter: oSorter});
};

/**
 * Sorts the list
 * @private
 */
sap.ui.model.json.JSONListBinding.prototype.applySort = function(){
	if (!this.oSorter) {
		return;
	}
	var that = this,
		aSortValues = [],
		oValue;
	jQuery.each(this.aIndices, function(i, iIndex) {
		oValue = that.oModel._getObject(that.oSorter.sPath, that.oList[iIndex]);
		if (typeof oValue == "string") {
			oValue = oValue.toUpperCase();
		}
		aSortValues[iIndex] = oValue;
	});
	this.aIndices.sort(function(a, b) {
		var valueA = aSortValues[a],
			valueB = aSortValues[b],
			returnValue = 0;
		if (valueA < valueB || valueB == null) {
			returnValue = -1;
		}
		if (valueA > valueB || valueA == null) {
			returnValue = 1;
		}
		if (that.oSorter.bDescending) {
			returnValue = -returnValue;
		}
		return returnValue;
	});
};

/**
 * @see sap.ui.model.ListBinding.prototype.filter
 *
 */
sap.ui.model.json.JSONListBinding.prototype.filter = function(aFilters){
	this.updateIndices();
	if (!aFilters || !jQuery.isArray(aFilters) || aFilters.length == 0) {
		this.aFilters = null;
		this.iLength = this._getLength();
	} else {
		this.aFilters = aFilters;
		this.applyFilter();
	}
	this.applySort();
	this._fireChange();
	this._fireFilter({filters: aFilters});
};

/**
 * Filters the list
 * Filters are first grouped according to their binding path.
 * All filters belonging to a group are ORed and after that the
 * results of all groups are ANDed.
 * Usually this means, all filters applied to a single table column
 * are ORed, while filters on different table columns are ANDed.
 *
 * @private
 */
sap.ui.model.json.JSONListBinding.prototype.applyFilter = function(){
	if (!this.aFilters) {
		return;
	}
	var that = this,
		oFilterGroups = {},
		aFilterGroup,
		aFiltered = [],
		bGroupFiltered = false,
		bFiltered = true;
	jQuery.each(this.aIndices, function(i, iIndex) {
		bFiltered = true;
		jQuery.each(that.aFilters, function(j, oFilter) {
			aFilterGroup = oFilterGroups[oFilter.sPath];
			if (!aFilterGroup) {
				aFilterGroup = oFilterGroups[oFilter.sPath] = [];
			}
			aFilterGroup.push(oFilter);
		});
		jQuery.each(oFilterGroups, function(sPath, aFilterGroup) {
			var oValue = that.oModel._getObject(sPath, that.oList[iIndex]);
			if (typeof oValue == "string") {
				oValue = oValue.toUpperCase();
			}
			bGroupFiltered = false;
			jQuery.each(aFilterGroup, function(j, oFilter) {
				var fnTest = that.getFilterFunction(oFilter);
				if (oValue != undefined && fnTest(oValue)) {
					bGroupFiltered = true;
					return false;
				}
			});
			if (!bGroupFiltered) {
				bFiltered = false;
				return false;
			}
		});
		if (bFiltered) {
			aFiltered.push(iIndex);
		}
	});
	this.aIndices = aFiltered;
	this.iLength = aFiltered.length;
};

/**
 * Provides a JS filter function for the given filter
 */
sap.ui.model.json.JSONListBinding.prototype.getFilterFunction = function(oFilter){
	if (oFilter.fnTest) {
		return oFilter.fnTest;
	}
	var oValue1 = oFilter.oValue1,
		oValue2 = oFilter.oValue2;
	if (typeof oValue1 == "string") {
		oValue1 = oValue1.toUpperCase();
	}
	if (typeof oValue2 == "string") {
		oValue2 = oValue2.toUpperCase();
	}
	switch (oFilter.sOperator) {
		case "EQ":
			oFilter.fnTest = function(value) { return value == oValue1; }; break;
		case "NE":
			oFilter.fnTest = function(value) { return value != oValue1; }; break;
		case "LT":
			oFilter.fnTest = function(value) { return value < oValue1; }; break;
		case "LE":
			oFilter.fnTest = function(value) { return value <= oValue1; }; break;
		case "GT":
			oFilter.fnTest = function(value) { return value > oValue1; }; break;
		case "GE":
			oFilter.fnTest = function(value) { return value >= oValue1; }; break;
		case "BT":
			oFilter.fnTest = function(value) { return (value > oValue1) && (value < oValue2); }; break;
		case "Contains":
			oFilter.fnTest = function(value) { return value.indexOf(oValue1) != -1; }; break;
		case "StartsWith":
			oFilter.fnTest = function(value) { return value.indexOf(oValue1) == 0; }; break;
		case "EndsWith":
			oFilter.fnTest = function(value) { return value.indexOf(oValue1) == value.length - new String(oFilter.oValue1).length; }; break;
		default:
			oFilter.fnTest = function(value) { return true; };
	}
	return oFilter.fnTest;
};

/**
 * Get distinct values
 *
 * @param {String} sPath
 *
 * @protected
 */
sap.ui.model.json.JSONListBinding.prototype.getDistinctValues = function(sPath){
	var aResult = [],
		oMap = {},
		sValue,
		that = this;
	jQuery.each(this.oList, function(i, oContext) {
		sValue = that.oModel.getProperty(sPath, oContext);
		if (!oMap[sValue]) {
			oMap[sValue] = true;
			aResult.push(sValue);
		}
	});
	return aResult;
};