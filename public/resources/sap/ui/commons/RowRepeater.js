/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ui.commons.RowRepeater.
jQuery.sap.declare("sap.ui.commons.RowRepeater");
jQuery.sap.require("sap.ui.commons.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new RowRepeater.
 * 
 * It accepts one JSON-like object (object literal) as parameter <code>mSettings</code> that can define values for any property, 
 * aggregation, association or event.<br/> 
 * If for a control a specific name is ambiguous (a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order.<br/> 
 * To resolve ambiguities, add an "aggregation:", "association:" or "event:" prefix to the key in the JSON object.<br/>
 * Allowed values are:
 * <ul>
 * <li>Properties
 * <ul>
 * <li>visible : boolean</li>
 * <li>numberOfRows : int</li>
 * <li>currentPage : int</li>
 * <li>showMoreSteps : int</li>
 * <li>fixedRowHeight : sap.ui.core.CSSSize</li>
 * <li>design : sap.ui.commons.RowRepeaterDesign</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>rows : sap.ui.core.Control</li>
 * <li>title : sap.ui.commons.Title</li>
 * <li>filters : sap.ui.commons.RowRepeaterFilter</li>
 * <li>sorters : sap.ui.commons.RowRepeaterSorter</li>
 * <li>noData : sap.ui.core.Control</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>filter : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>sort : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>page : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>resize : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string}
 *        [sId] optional id for the new control; generated automatically if no id is given. 
 *        Note: this can be omitted, no matter whether <code>mSettings</code> is given or not!
 * @param {object}
 *        [mSettings] optional map/JSON-object with initial values for the new control.<br/>
 *
 * @class
 * This control displays items in a stacked list format, allowing the user to page in order to see more items or to use the offered filtering and sorting capabilities in order to manipulate the displayed data.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.2.0
 *
 * @constructor   
 * @public
 */
sap.ui.commons.RowRepeater = function (sId, mSettings) {
	sap.ui.core.Control.apply(this, arguments);
};

// chain the prototypes
sap.ui.commons.RowRepeater.prototype = jQuery.sap.newObject(sap.ui.core.Control.prototype);

/*
 * Describe the sap.ui.commons.RowRepeater. 
 * Resulting metadata can be obtained via sap.ui.commons.RowRepeater.getMetadata();
 */ 
sap.ui.core.Element.defineClass("sap.ui.commons.RowRepeater", {

  // ---- object ----
  baseType : "sap.ui.core.Control",
  publicMethods : [
    // properties 
    "getVisible", "setVisible", "getNumberOfRows", "setNumberOfRows", "getCurrentPage", "setCurrentPage", "getShowMoreSteps", "setShowMoreSteps", "getFixedRowHeight", "setFixedRowHeight", "getDesign", "setDesign", 
    // aggregations
    "getRows", "insertRow", "addRow", "removeRow", "removeAllRows", "indexOfRow", "destroyRows", "bindRows", "unbindRows", "getTitle", "setTitle", "destroyTitle", "getFilters", "insertFilter", "addFilter", "removeFilter", "removeAllFilters", "indexOfFilter", "destroyFilters", "getSorters", "insertSorter", "addSorter", "removeSorter", "removeAllSorters", "indexOfSorter", "destroySorters", "getNoData", "setNoData", "destroyNoData", 
    // associations
    
    // events
    "attachFilter", "detachFilter", "attachSort", "detachSort", "attachPage", "detachPage", "attachResize", "detachResize", 
    // methods
    "triggerShowMore", "resize", "applyFilter", "triggerSort", "firstPage", "lastPage", "previousPage", "nextPage", "gotoPage"
  ],

  // ---- control specific ----
  library : "sap.ui.commons",
  properties : {
    "visible" : {name : "visible", type : "boolean", group : "Appearance", defaultValue : true},
    "numberOfRows" : {name : "numberOfRows", type : "int", group : "Dimension", defaultValue : 5},
    "currentPage" : {name : "currentPage", type : "int", group : "Data", defaultValue : 1},
    "showMoreSteps" : {name : "showMoreSteps", type : "int", group : "Behavior", defaultValue : 0},
    "fixedRowHeight" : {name : "fixedRowHeight", type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : ''},
    "design" : {name : "design", type : "sap.ui.commons.RowRepeaterDesign", group : "Appearance", defaultValue : sap.ui.commons.RowRepeaterDesign.Standard}
  },
  defaultAggregation : "rows",
  aggregations : {
    "rows" : {name : "rows", type : "sap.ui.core.Control", multiple : true, singularName : "row"}, 
    "title" : {name : "title", type : "sap.ui.commons.Title", multiple : false}, 
    "filters" : {name : "filters", type : "sap.ui.commons.RowRepeaterFilter", multiple : true, singularName : "filter"}, 
    "sorters" : {name : "sorters", type : "sap.ui.commons.RowRepeaterSorter", multiple : true, singularName : "sorter"}, 
    "noData" : {name : "noData", type : "sap.ui.core.Control", multiple : false}
  },
  associations : {},
  events : {
    "filter" : "filter", 
    "sort" : "sort", 
    "page" : "page", 
    "resize" : "resize"
  }

});	

sap.ui.commons.RowRepeater.M_EVENTS = {'filter':'filter','sort':'sort','page':'page','resize':'resize'};


/**
 * Getter for property <code>visible</code>.
 * Invisible row-repeaters are not rendered.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * 
 */
sap.ui.commons.RowRepeater.prototype.getVisible = function() {
	return this.getProperty("visible");
};

/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.setVisible = function(bVisible) {
	this.setProperty("visible", bVisible);
	return this;
};


/**
 * Getter for property <code>numberOfRows</code>.
 * Number of rows displayed.
 *
 * Default value is <code>5</code>
 *
 * @return {int} the value of property <code>numberOfRows</code>
 * @public
 * 
 */
sap.ui.commons.RowRepeater.prototype.getNumberOfRows = function() {
	return this.getProperty("numberOfRows");
};

/**
 * Setter for property <code>numberOfRows</code>.
 *
 * Default value is <code>5</code> 
 *
 * @param {int} iNumberOfRows  new value for property <code>numberOfRows</code>
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.setNumberOfRows = function(iNumberOfRows) {
	this.setProperty("numberOfRows", iNumberOfRows);
	return this;
};


/**
 * Getter for property <code>currentPage</code>.
 * The index of the page currently displayed. The index starts at 1.
 *
 * Default value is <code>1</code>
 *
 * @return {int} the value of property <code>currentPage</code>
 * @public
 * 
 */
sap.ui.commons.RowRepeater.prototype.getCurrentPage = function() {
	return this.getProperty("currentPage");
};

/**
 * Setter for property <code>currentPage</code>.
 *
 * Default value is <code>1</code> 
 *
 * @param {int} iCurrentPage  new value for property <code>currentPage</code>
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.setCurrentPage = function(iCurrentPage) {
	this.setProperty("currentPage", iCurrentPage);
	return this;
};


/**
 * Getter for property <code>showMoreSteps</code>.
 * Step size used to increase the numberOfRows value. This feature is only active if value is greater than 0. This will deactivate the paging feature.
 *
 * Default value is <code>0</code>
 *
 * @return {int} the value of property <code>showMoreSteps</code>
 * @public
 * 
 */
sap.ui.commons.RowRepeater.prototype.getShowMoreSteps = function() {
	return this.getProperty("showMoreSteps");
};

/**
 * Setter for property <code>showMoreSteps</code>.
 *
 * Default value is <code>0</code> 
 *
 * @param {int} iShowMoreSteps  new value for property <code>showMoreSteps</code>
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.setShowMoreSteps = function(iShowMoreSteps) {
	this.setProperty("showMoreSteps", iShowMoreSteps);
	return this;
};


/**
 * Getter for property <code>fixedRowHeight</code>.
 * Row height adapts to rendered content. If a fixed height is specified the cells have a maximum height and the overflow will be hidden.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>fixedRowHeight</code>
 * @public
 * 
 */
sap.ui.commons.RowRepeater.prototype.getFixedRowHeight = function() {
	return this.getProperty("fixedRowHeight");
};

/**
 * Setter for property <code>fixedRowHeight</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sFixedRowHeight  new value for property <code>fixedRowHeight</code>
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.setFixedRowHeight = function(sFixedRowHeight) {
	this.setProperty("fixedRowHeight", sFixedRowHeight);
	return this;
};


/**
 * Getter for property <code>design</code>.
 * The visual design of the control.
 *
 * Default value is <code>Standard</code>
 *
 * @return {sap.ui.commons.RowRepeaterDesign} the value of property <code>design</code>
 * @public
 * 
 */
sap.ui.commons.RowRepeater.prototype.getDesign = function() {
	return this.getProperty("design");
};

/**
 * Setter for property <code>design</code>.
 *
 * Default value is <code>Standard</code> 
 *
 * @param {sap.ui.commons.RowRepeaterDesign} oDesign  new value for property <code>design</code>
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.setDesign = function(oDesign) {
	this.setProperty("design", oDesign);
	return this;
};

	
/**
 * Getter for aggregation <code>rows</code>.<br/>
 * Rows to be repeated.
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 */
sap.ui.commons.RowRepeater.prototype.getRows = function() {
	return this.getAggregation("rows", []);
};


/**
 * Inserts a row into the aggregation named <code>rows</code>.
 *
 * @param {sap.ui.core.Control}
 *          oRow the row to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the row should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the row is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the row is inserted at 
 *             the last position        
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.insertRow = function(oRow, iIndex) {
	this.insertAggregation("rows", oRow, iIndex);
	return this;
};

/**
 * Adds some row <code>oRow</code> 
 * to the aggregation named <code>rows</code>.
 *
 * @param {sap.ui.core.Control}
 *            oRow the row to add; if empty, nothing is inserted
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public 
 */
sap.ui.commons.RowRepeater.prototype.addRow = function(oRow) {
	this.addAggregation("rows", oRow);
	return this;
};

/**
 * Removes an row from the aggregation named <code>rows</code>.
 *
 * @param {int | string | sap.ui.core.Control} vRow the row to remove or its index or id
 * @return {sap.ui.core.Control} the removed row or null
 * @public
 */
sap.ui.commons.RowRepeater.prototype.removeRow = function(vRow) {
	return this.removeAggregation("rows", vRow);
};

/**
 * Removes all the controls in the aggregation named <code>rows</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 */
sap.ui.commons.RowRepeater.prototype.removeAllRows = function() {
	return this.removeAllAggregation("rows");
};

/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>rows</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oRow the row whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 */
sap.ui.commons.RowRepeater.prototype.indexOfRow = function(oRow) {
	return this.indexOfAggregation("rows", oRow);
};
	

/**
 * Destroys all the rows in the aggregation 
 * named <code>rows</code>.
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.destroyRows = function() {
	this.destroyAggregation("rows");
	return this;
};


/**
 * Binder for aggregation <code>rows</code>.
 *
 * @param {string} sPath path to a list in the model 
 * @param {sap.ui.core.Element} oTemplate the control template for this aggregation
 * @param {sap.ui.model.Sorter} oSorter the initial sort order (optional)
 * @param {array} aFilters the predefined filters for this aggregation (optional)
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.bindRows = function(sPath, oTemplate, oSorter, aFilters) {
	this.bindAggregation("rows", sPath, oTemplate, oSorter, aFilters);
	return this;
};

/**
 * Unbinder for aggregation <code>rows</code>.
 *
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.unbindRows = function() {
	this.unbindAggregation("rows");
	return this;
};

	
/**
 * Getter for aggregation <code>title</code>.<br/>
 * Title to be displayed in top left corner. Either text or icon.
 * 
 * @return {sap.ui.commons.Title}
 * @public
 */
sap.ui.commons.RowRepeater.prototype.getTitle = function() {
	return this.getAggregation("title", null);
};


/**
 * Setter for the aggregated <code>title</code>.
 * @param oTitle {sap.ui.commons.Title}
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.setTitle = function(oTitle) {
	this.setAggregation("title", oTitle);
	return this;
};
	

/**
 * Destroys the title in the aggregation 
 * named <code>title</code>.
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.destroyTitle = function() {
	this.destroyAggregation("title");
	return this;
};

	
/**
 * Getter for aggregation <code>filters</code>.<br/>
 * Filters to be provided in toolbar.
 * 
 * @return {sap.ui.commons.RowRepeaterFilter[]}
 * @public
 */
sap.ui.commons.RowRepeater.prototype.getFilters = function() {
	return this.getAggregation("filters", []);
};


/**
 * Inserts a filter into the aggregation named <code>filters</code>.
 *
 * @param {sap.ui.commons.RowRepeaterFilter}
 *          oFilter the filter to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the filter should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the filter is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the filter is inserted at 
 *             the last position        
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.insertFilter = function(oFilter, iIndex) {
	this.insertAggregation("filters", oFilter, iIndex);
	return this;
};

/**
 * Adds some filter <code>oFilter</code> 
 * to the aggregation named <code>filters</code>.
 *
 * @param {sap.ui.commons.RowRepeaterFilter}
 *            oFilter the filter to add; if empty, nothing is inserted
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public 
 */
sap.ui.commons.RowRepeater.prototype.addFilter = function(oFilter) {
	this.addAggregation("filters", oFilter);
	return this;
};

/**
 * Removes an filter from the aggregation named <code>filters</code>.
 *
 * @param {int | string | sap.ui.commons.RowRepeaterFilter} vFilter the filter to remove or its index or id
 * @return {sap.ui.commons.RowRepeaterFilter} the removed filter or null
 * @public
 */
sap.ui.commons.RowRepeater.prototype.removeFilter = function(vFilter) {
	return this.removeAggregation("filters", vFilter);
};

/**
 * Removes all the controls in the aggregation named <code>filters</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.commons.RowRepeaterFilter[]} an array of the removed elements (might be empty)
 * @public
 */
sap.ui.commons.RowRepeater.prototype.removeAllFilters = function() {
	return this.removeAllAggregation("filters");
};

/**
 * Checks for the provided <code>sap.ui.commons.RowRepeaterFilter</code> in the aggregation named <code>filters</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.commons.RowRepeaterFilter}
 *            oFilter the filter whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 */
sap.ui.commons.RowRepeater.prototype.indexOfFilter = function(oFilter) {
	return this.indexOfAggregation("filters", oFilter);
};
	

/**
 * Destroys all the filters in the aggregation 
 * named <code>filters</code>.
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.destroyFilters = function() {
	this.destroyAggregation("filters");
	return this;
};

	
/**
 * Getter for aggregation <code>sorters</code>.<br/>
 * Sorters to be provided in secondary toolbar.
 * 
 * @return {sap.ui.commons.RowRepeaterSorter[]}
 * @public
 */
sap.ui.commons.RowRepeater.prototype.getSorters = function() {
	return this.getAggregation("sorters", []);
};


/**
 * Inserts a sorter into the aggregation named <code>sorters</code>.
 *
 * @param {sap.ui.commons.RowRepeaterSorter}
 *          oSorter the sorter to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the sorter should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the sorter is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the sorter is inserted at 
 *             the last position        
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.insertSorter = function(oSorter, iIndex) {
	this.insertAggregation("sorters", oSorter, iIndex);
	return this;
};

/**
 * Adds some sorter <code>oSorter</code> 
 * to the aggregation named <code>sorters</code>.
 *
 * @param {sap.ui.commons.RowRepeaterSorter}
 *            oSorter the sorter to add; if empty, nothing is inserted
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public 
 */
sap.ui.commons.RowRepeater.prototype.addSorter = function(oSorter) {
	this.addAggregation("sorters", oSorter);
	return this;
};

/**
 * Removes an sorter from the aggregation named <code>sorters</code>.
 *
 * @param {int | string | sap.ui.commons.RowRepeaterSorter} vSorter the sorter to remove or its index or id
 * @return {sap.ui.commons.RowRepeaterSorter} the removed sorter or null
 * @public
 */
sap.ui.commons.RowRepeater.prototype.removeSorter = function(vSorter) {
	return this.removeAggregation("sorters", vSorter);
};

/**
 * Removes all the controls in the aggregation named <code>sorters</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.commons.RowRepeaterSorter[]} an array of the removed elements (might be empty)
 * @public
 */
sap.ui.commons.RowRepeater.prototype.removeAllSorters = function() {
	return this.removeAllAggregation("sorters");
};

/**
 * Checks for the provided <code>sap.ui.commons.RowRepeaterSorter</code> in the aggregation named <code>sorters</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.commons.RowRepeaterSorter}
 *            oSorter the sorter whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 */
sap.ui.commons.RowRepeater.prototype.indexOfSorter = function(oSorter) {
	return this.indexOfAggregation("sorters", oSorter);
};
	

/**
 * Destroys all the sorters in the aggregation 
 * named <code>sorters</code>.
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.destroySorters = function() {
	this.destroyAggregation("sorters");
	return this;
};

	
/**
 * Getter for aggregation <code>noData</code>.<br/>
 * This control is shown, in case there is no data available to be displayed in the RowRepeater.
 * 
 * @return {sap.ui.core.Control}
 * @public
 */
sap.ui.commons.RowRepeater.prototype.getNoData = function() {
	return this.getAggregation("noData", null);
};


/**
 * Setter for the aggregated <code>noData</code>.
 * @param oNoData {sap.ui.core.Control}
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.setNoData = function(oNoData) {
	this.setAggregation("noData", oNoData);
	return this;
};
	

/**
 * Destroys the noData in the aggregation 
 * named <code>noData</code>.
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.destroyNoData = function() {
	this.destroyAggregation("noData");
	return this;
};


/**
 * This event is triggered when a filter is set. 
 *
 * @name sap.ui.commons.RowRepeater#filter
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {string} oControlEvent.getParameters.filterId The ID of the filter that has just been applied.
 * @public
 */
 
/**
 * Attach event-handler <code>fnFunction</code> to the 'filter' event of this <code>sap.ui.commons.RowRepeater</code>.<br/>
 * This event is triggered when a filter is set. 
 *
 * @param {object}
 *            [oData] The object, that should be passed along with the event-object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs. This function will be called on the
 *            oListener-instance (if present) or on the this control instance.
 * @param {object}
 *            [oListener] Object on which to call the given function. If empty, this control instance is used.
 *
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.attachFilter = function(oData, fnFunction, oListener) {
	this.attachEvent("filter", oData, fnFunction, oListener);
	return this;
};

/**
 * Detach event-handler <code>fnFunction</code> from the 'filter' event of this <code>sap.ui.commons.RowRepeater</code>.<br/>
 *
 * The passed function and listener object must match the ones previously used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Object on which the given function had to be called.
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.detachFilter = function(fnFunction, oListener) {
	this.detachEvent("filter", fnFunction, oListener);
	return this;	
};

/**
 * Fire event filter to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'filterId' of type <code>string</code> The ID of the filter that has just been applied.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @protected
 */
sap.ui.commons.RowRepeater.prototype.fireFilter = function(mArguments) {
	this.fireEvent("filter", mArguments);
	return this;
};


/**
 * This event is triggered when a sorting is applied. 
 *
 * @name sap.ui.commons.RowRepeater#sort
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {string} oControlEvent.getParameters.sorterId The ID of the sorter that has just been applied.
 * @public
 */
 
/**
 * Attach event-handler <code>fnFunction</code> to the 'sort' event of this <code>sap.ui.commons.RowRepeater</code>.<br/>
 * This event is triggered when a sorting is applied. 
 *
 * @param {object}
 *            [oData] The object, that should be passed along with the event-object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs. This function will be called on the
 *            oListener-instance (if present) or on the this control instance.
 * @param {object}
 *            [oListener] Object on which to call the given function. If empty, this control instance is used.
 *
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.attachSort = function(oData, fnFunction, oListener) {
	this.attachEvent("sort", oData, fnFunction, oListener);
	return this;
};

/**
 * Detach event-handler <code>fnFunction</code> from the 'sort' event of this <code>sap.ui.commons.RowRepeater</code>.<br/>
 *
 * The passed function and listener object must match the ones previously used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Object on which the given function had to be called.
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.detachSort = function(fnFunction, oListener) {
	this.detachEvent("sort", fnFunction, oListener);
	return this;	
};

/**
 * Fire event sort to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'sorterId' of type <code>string</code> The ID of the sorter that has just been applied.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @protected
 */
sap.ui.commons.RowRepeater.prototype.fireSort = function(mArguments) {
	this.fireEvent("sort", mArguments);
	return this;
};


/**
 * This event is triggered when paging was executed. 
 *
 * @name sap.ui.commons.RowRepeater#page
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {int} oControlEvent.getParameters.currentPage The value of the currentPage property after the change.
 * @param {int} oControlEvent.getParameters.previousPage The value of the currentPage property before the change.
 * @public
 */
 
/**
 * Attach event-handler <code>fnFunction</code> to the 'page' event of this <code>sap.ui.commons.RowRepeater</code>.<br/>
 * This event is triggered when paging was executed. 
 *
 * @param {object}
 *            [oData] The object, that should be passed along with the event-object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs. This function will be called on the
 *            oListener-instance (if present) or on the this control instance.
 * @param {object}
 *            [oListener] Object on which to call the given function. If empty, this control instance is used.
 *
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.attachPage = function(oData, fnFunction, oListener) {
	this.attachEvent("page", oData, fnFunction, oListener);
	return this;
};

/**
 * Detach event-handler <code>fnFunction</code> from the 'page' event of this <code>sap.ui.commons.RowRepeater</code>.<br/>
 *
 * The passed function and listener object must match the ones previously used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Object on which the given function had to be called.
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.detachPage = function(fnFunction, oListener) {
	this.detachEvent("page", fnFunction, oListener);
	return this;	
};

/**
 * Fire event page to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'currentPage' of type <code>int</code> The value of the currentPage property after the change.</li>
 * <li>'previousPage' of type <code>int</code> The value of the currentPage property before the change.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @protected
 */
sap.ui.commons.RowRepeater.prototype.firePage = function(mArguments) {
	this.fireEvent("page", mArguments);
	return this;
};


/**
 * This event is triggered when the number of rows was changed. 
 *
 * @name sap.ui.commons.RowRepeater#resize
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {int} oControlEvent.getParameters.numberOfRows The value of the numberOfRows property after the change.
 * @param {int} oControlEvent.getParameters.previousNumberOfRows The value of the numberOfRows property before the change.
 * @public
 */
 
/**
 * Attach event-handler <code>fnFunction</code> to the 'resize' event of this <code>sap.ui.commons.RowRepeater</code>.<br/>
 * This event is triggered when the number of rows was changed. 
 *
 * @param {object}
 *            [oData] The object, that should be passed along with the event-object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs. This function will be called on the
 *            oListener-instance (if present) or on the this control instance.
 * @param {object}
 *            [oListener] Object on which to call the given function. If empty, this control instance is used.
 *
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.attachResize = function(oData, fnFunction, oListener) {
	this.attachEvent("resize", oData, fnFunction, oListener);
	return this;
};

/**
 * Detach event-handler <code>fnFunction</code> from the 'resize' event of this <code>sap.ui.commons.RowRepeater</code>.<br/>
 *
 * The passed function and listener object must match the ones previously used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Object on which the given function had to be called.
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.detachResize = function(fnFunction, oListener) {
	this.detachEvent("resize", fnFunction, oListener);
	return this;	
};

/**
 * Fire event resize to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'numberOfRows' of type <code>int</code> The value of the numberOfRows property after the change.</li>
 * <li>'previousNumberOfRows' of type <code>int</code> The value of the numberOfRows property before the change.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @protected
 */
sap.ui.commons.RowRepeater.prototype.fireResize = function(mArguments) {
	this.fireEvent("resize", mArguments);
	return this;
};


/**
 * Increments the number of rows. This method will only trigger a showMore if the property showMoreSteps is set.
 *
 * @name sap.ui.commons.RowRepeater.prototype.triggerShowMore
 * @function

 * @type void
 * @public
 */


/**
 * Resizes the row repeater by changing the number of displayed rows. This method will only resize the RowRepeater if the property showMoreSteps is set.
 *
 * @name sap.ui.commons.RowRepeater.prototype.resize
 * @function
 * @param {int} 
 *         iNumberOfRows
 *         The new value of number of rows displayed.

 * @type void
 * @public
 */


/**
 * Applies a filter.
 *
 * @name sap.ui.commons.RowRepeater.prototype.applyFilter
 * @function
 * @param {string} 
 *         sId
 *         The ID if the filter.

 * @type void
 * @public
 */


/**
 * Sort the data.
 *
 * @name sap.ui.commons.RowRepeater.prototype.triggerSort
 * @function
 * @param {string} 
 *         sId
 *         The ID of the sorter.

 * @type void
 * @public
 */


/**
 * Switch to first page.
 *
 * @name sap.ui.commons.RowRepeater.prototype.firstPage
 * @function

 * @type void
 * @public
 */


/**
 * Switch to last page.
 *
 * @name sap.ui.commons.RowRepeater.prototype.lastPage
 * @function

 * @type void
 * @public
 */


/**
 * Switch to previous page.
 *
 * @name sap.ui.commons.RowRepeater.prototype.previousPage
 * @function

 * @type void
 * @public
 */


/**
 * Switch to next page.
 *
 * @name sap.ui.commons.RowRepeater.prototype.nextPage
 * @function

 * @type void
 * @public
 */


/**
 * Switch to specified page.
 *
 * @name sap.ui.commons.RowRepeater.prototype.gotoPage
 * @function
 * @param {int} 
 *         iPageNumber
 *         The index of the page to go to.

 * @type void
 * @public
 */


// Start of sap/ui/commons/RowRepeater.js
///**
//* This file defines behavior for the control,
//*/

/**
 * This value of the paging mode boolean is true if the showMoreSteps
 * property is not set. This value is updated whenever the value
 * of showMoreSteps is changed.
 *
 * @private
 */
sap.ui.commons.RowRepeater.prototype.bPagingMode = true;

/**
 * All animations of the RowRepeater control can be centrally switched
 * off by setting the <code>bShowAnimation</code> flag to <code>false</code>.
 *
 * @private
 */
sap.ui.commons.RowRepeater.prototype.bShowAnimation = true;


/* animation constants */
sap.ui.commons.RowRepeater.SHOW_MORE = "show_more";
sap.ui.commons.RowRepeater.RESIZE = "resize";
sap.ui.commons.RowRepeater.FIRST_PAGE = "first_page";
sap.ui.commons.RowRepeater.LAST_PAGE = "last_page";
sap.ui.commons.RowRepeater.PREVIOUS_PAGE = "previous_page";
sap.ui.commons.RowRepeater.NEXT_PAGE = "next_page";
sap.ui.commons.RowRepeater.GOTO_PAGE = "goto_page";

sap.ui.commons.RowRepeater.prototype.init = function() {

	// local variables
	var sId = this.getId();

	// get reference to resource bundle
	this.oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");

	// initialize animation and queuing variables
	this.sCurrentAnimation = null;
	this.aAnimationQueue = [];
	this.aRemoveBuffer = [];

	// previous page and numberOfRows animation
	this.iPreviousPage = this.getCurrentPage();
	this.iPreviousNumberOfRows = this.getNumberOfRows();

	// create filter and sorter toolbar control and add as aggregation
	this.setAggregation( "filterToolbar", new sap.ui.commons.Toolbar(sId+"-ftb",{standalone:false,design:sap.ui.commons.ToolbarDesign.Transparent}));
	this.setAggregation( "sorterToolbar", new sap.ui.commons.Toolbar(sId+"-stb",{standalone:false}));

	// create pager controls and their event handlers, add them as aggregations
	var oPager = new sap.ui.commons.Paginator(sId+"-fp",{page:[this.paging,this]});
	this.setAggregation("footerPager",oPager);

	// create show more buttons and add them as aggregation
	var sShowMoreText = this.oResourceBundle.getText("SHOW_MORE");
	this.setAggregation( "headerShowMoreButton", new sap.ui.commons.Button(sId+"-hsm",{text:sShowMoreText,press:[this.triggerShowMore,this]}));
	this.setAggregation( "footerShowMoreButton", new sap.ui.commons.Button(sId+"-fsm",{text:sShowMoreText,press:[this.triggerShowMore,this]}));

};



/*
 * PUBLIC API METHODS
 */
// TODO: check where to document: here or in API definition
/**
 * The <code>triggerShowMore</code> function increments the number of rows by the
 * value of <code>showMoreSteps</code>.
 *
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.triggerShowMore = function() {

	// execute only if showMoreSteps is bigger than 0
	if(this.getShowMoreSteps()<=0) {
		return this;
	}

	// local variables
	var iShowMoreSteps = this.getShowMoreSteps();
	var iNumberOfRows = this.getNumberOfRows();

	// verify that the new value is not larger than number of rows available
	var iNewNumberOfRows = Math.min(this.getRows().length,iNumberOfRows+iShowMoreSteps);

	// exit if value remains the same
	if(iNumberOfRows===iNewNumberOfRows) {
		return this;
	}

	// start animation or just set the property
	if(this.bShowAnimation) {

		// check if animation is running before starting a new animation
		if( this.sCurrentAnimation !== null ) {
			this.aAnimationQueue.push({	name:sap.ui.commons.RowRepeater.SHOW_MORE,
				animationFunction:this.triggerShowMore,
				args:arguments});
			return this;
		} else {
			this.sCurrentAnimation = sap.ui.commons.RowRepeater.SHOW_MORE;
		}

		// set property and animate
		this.iPreviousNumberOfRows = iNumberOfRows;
		this.setProperty("numberOfRows",iNewNumberOfRows,true);
		this.startResizeAnimation();

	} else {

		// set property and invalidate
		this.setNumberOfRows(iNewNumberOfRows);

	}

	// fire page event
	this.fireResize({numberOfRows:iNewNumberOfRows,previousNumberOfRows:iNumberOfRows});

	// return instance for chaining
	return this;

};

sap.ui.commons.RowRepeater.prototype.resize = function(numberOfRows) {

	// execute only if showMoreSteps is bigger than 0
	if(this.getShowMoreSteps()<=0) {
		return this;
	}

	// local variables
	var iNumberOfRows = this.getNumberOfRows();

	// exit if new value is not in range or equals to old value
	if(numberOfRows<=0 || numberOfRows>this.getRows().length || numberOfRows===iNumberOfRows ) {
		return this;
	}

	// start animation or just set the property
	if(this.bShowAnimation) {

		// check if animation is running before starting a new animation
		if( this.sCurrentAnimation !== null ) {
			this.aAnimationQueue.push({	name:sap.ui.commons.RowRepeater.RESIZE,
				animationFunction:this.resize,
				args:arguments});
			return this;
		} else {
			this.sCurrentAnimation = sap.ui.commons.RowRepeater.RESIZE;
		}

		// set property and animate
		this.iPreviousNumberOfRows = iNumberOfRows;
		this.setProperty("numberOfRows",numberOfRows,true);
		this.startResizeAnimation();

	} else {

		// set property and invalidate
		this.setNumberOfRows(numberOfRows);

	}

	// fire page event
	this.fireResize({numberOfRows:numberOfRows,previousNumberOfRows:iNumberOfRows});

	// return instance for chaining
	return this;

};

sap.ui.commons.RowRepeater.prototype.applyFilter = function(id) {

	// local variables
	var aFilters = this.getFilters();
	var oListBinding = this.getBinding("rows");
	var oFilter, n;

	// exit directly if there are no filters or no binding defined
	if(aFilters.length===0 || oListBinding===null) {
		return this;
	}

	// try to read the filter defined by the ID, unfortunately by looping
	for( n=0; n<aFilters.length; n++ ) {
		if(aFilters[n].getId()===id) {
			// we found the requested filter
			oFilter = aFilters[n];
			break;
		}
	}

	// don't do anything if we can't find the filter
	if(oFilter) {

		// apply the filter assigned to filter item
		oListBinding.filter(oFilter.getFilters());

		// fire the filter
		this.fireFilter({filterId:id});

		// goto first page via public API method (i.e. animated)
		this.firstPage();

	}

	// return instance to allow chaining
	return this;

};

sap.ui.commons.RowRepeater.prototype.triggerSort = function(id) {

	// local variables
	var aSorters = this.getSorters();
	var oListBinding = this.getBinding("rows");
	var oSorter, n;

	// exit directly if there are no sorters or no binding defined
	if(aSorters.length===0 || oListBinding===null) {
		return this;
	}

	// try to read the sorter defined by the ID, unfortunately by looping
	for( n=0; n<aSorters.length; n++ ) {
		if(aSorters[n].getId()===id) {
			// we found the requested filter
			oSorter = aSorters[n];
			break;
		}
	}

	// don't do anything if we can't find the sorter
	if(oSorter) {

		// trigger the sorter assigned to sorter item
		oListBinding.sort(oSorter.getSorter());

		// fire sort event
		this.fireSort({sorterId:id});

		// goto first page via public API method (i.e. animated)
		this.firstPage();

	}

	// return instance to allow chaining
	return this;

};

sap.ui.commons.RowRepeater.prototype.firstPage = function() {

	// only execute if showMoreSteps is not bigger than 0
	if(this.getShowMoreSteps()>0) {
		return this;
	}

	// local variable
	var iCurrentPage = this.getCurrentPage();

	// don't do anything if we are on the first page
	if(iCurrentPage===1) {
		return this;
	}

	// keep pagers in sync
	this.getAggregation("footerPager").setCurrentPage(1);

	// start animation or just set the property
	if(this.bShowAnimation) {

		// check if animation is running before starting a new animation
		if( this.sCurrentAnimation !== null ) {
			this.aAnimationQueue.push({	name:sap.ui.commons.RowRepeater.FIRST_PAGE,
				animationFunction:this.firstPage,
				args:arguments});
			return this;
		} else {
			this.sCurrentAnimation = sap.ui.commons.RowRepeater.FIRST_PAGE;
		}

		// set property and animate
		this.iPreviousPage = iCurrentPage;
		this.setProperty("currentPage",1,true);
		this.startPagingAnimation();

	} else {

		// set property and invalidate
		this.setCurrentPage(1);

	}

	// fire page event
	this.firePage({currentPage:1,previousPage:iCurrentPage});

	// return instance for chaining
	return this;

};

sap.ui.commons.RowRepeater.prototype.lastPage = function() {

	// only execute if showMoreSteps is not bigger than 0
	if(this.getShowMoreSteps()>0) {
		return this;
	}

	// local variable
	var iCurrentPage = this.getCurrentPage();
	var iLastPage = Math.ceil(this.getRows().length/this.getNumberOfRows());

	// don't do anything if we are on the last page
	if(iCurrentPage===iLastPage) {
		return this;
	}

	// keep pagers in sync
	this.getAggregation("footerPager").setCurrentPage(iLastPage);

	// start animation or just set the property
	if(this.bShowAnimation) {

		// check if animation is running before starting a new animation
		if( this.sCurrentAnimation !== null ) {
			this.aAnimationQueue.push({	name:sap.ui.commons.RowRepeater.LAST_PAGE,
				animationFunction:this.lastPage,
				args:arguments});
			return this;
		} else {
			this.sCurrentAnimation = sap.ui.commons.RowRepeater.LAST_PAGE;
		}

		// set property and animate
		this.iPreviousPage = iCurrentPage;
		this.setProperty("currentPage",iLastPage,true);
		this.startPagingAnimation();

	} else {

		// set property and invalidate
		this.setCurrentPage(iLastPage);

	}

	// fire page event
	this.firePage({currentPage:iLastPage,previousPage:iCurrentPage});

	// return instance for chaining
	return this;

};

sap.ui.commons.RowRepeater.prototype.previousPage = function() {

	// only execute if showMoreSteps is not bigger than 0
	if(this.getShowMoreSteps()>0) {
		return this;
	}

	// local variable
	var iCurrentPage = this.getCurrentPage();

	// don't do anything if we are on the first page or even below
	if(iCurrentPage<=1) {
		return this;
	}

	// keep pagers in sync
	this.getAggregation("footerPager").setCurrentPage(iCurrentPage-1);

	// start animation or just set the property
	if(this.bShowAnimation) {

		// check if animation is running before starting a new animation
		if( this.sCurrentAnimation !== null ) {
			this.aAnimationQueue.push({	name:sap.ui.commons.RowRepeater.PREVIOUS_PAGE,
				animationFunction:this.previousPage,
				args:arguments});
			return this;
		} else {
			this.sCurrentAnimation = sap.ui.commons.RowRepeater.PREVIOUS_PAGE;
		}

		// set property and animate
		this.iPreviousPage = iCurrentPage;
		this.setProperty("currentPage",iCurrentPage-1,true);
		this.startPagingAnimation();

	} else {

		// set property and invalidate
		this.setCurrentPage(iCurrentPage-1);

	}

	// fire page event
	this.firePage({currentPage:iCurrentPage-1,previousPage:iCurrentPage});

	// return instance for chaining
	return this;

};

sap.ui.commons.RowRepeater.prototype.nextPage = function() {

	// only execute if showMoreSteps is not bigger than 0
	if(this.getShowMoreSteps()>0) {
		return this;
	}

	// local variable
	var iCurrentPage = this.getCurrentPage();
	var iLastPage = Math.ceil(this.getRows().length/this.getNumberOfRows());

	// don't do anything if we are on the last page or even further
	if(iCurrentPage>=iLastPage) {
		return this;
	}

	// keep pagers in sync
	this.getAggregation("footerPager").setCurrentPage(iCurrentPage+1);

	// start animation or just set the property
	if(this.bShowAnimation) {

		// check if animation is running before starting a new animation
		if( this.sCurrentAnimation !== null ) {
			this.aAnimationQueue.push({	name:sap.ui.commons.RowRepeater.NEXT_PAGE,
				animationFunction:this.nextPage,
				args:arguments});
			return this;
		} else {
			this.sCurrentAnimation = sap.ui.commons.RowRepeater.NEXT_PAGE;
		}

		// set property and animate
		this.iPreviousPage = iCurrentPage;
		this.setProperty("currentPage",iCurrentPage+1,true);
		this.startPagingAnimation();

	} else {

		// set property and invalidate
		this.setCurrentPage(iCurrentPage+1);

	}

	// fire page event
	this.firePage({currentPage:iCurrentPage+1,previousPage:iCurrentPage});

	// return instance for chaining
	return this;

};

sap.ui.commons.RowRepeater.prototype.gotoPage = function(iPageNumber) {

	// only execute if showMoreSteps is not bigger than 0
	if(this.getShowMoreSteps()>0) {
		return this;
	}

	// local variable
	var iCurrentPage = this.getCurrentPage();
	var iLastPage = Math.ceil(this.getRows().length/this.getNumberOfRows());

	// don't do anything if page if not in range or same as before
	if(iPageNumber<1 || iPageNumber>iLastPage || iCurrentPage===iPageNumber) {
		return this;
	}

	// keep pagers in sync
	this.getAggregation("footerPager").setCurrentPage(iPageNumber);

	// start animation or just set the property
	if(this.bShowAnimation) {

		// check if animation is running before starting a new animation
		if( this.sCurrentAnimation !== null ) {
			this.aAnimationQueue.push({	name:sap.ui.commons.RowRepeater.GOTO_PAGE,
				animationFunction:this.gotoPage,
				args:arguments});
			return this;
		} else {
			this.sCurrentAnimation = sap.ui.commons.RowRepeater.GOTO_PAGE;
		}

		// set property and animate
		this.iPreviousPage = iCurrentPage;
		this.setProperty("currentPage",iPageNumber,true);
		this.startPagingAnimation();

	} else {

		// set property and invalidate
		this.setCurrentPage(iPageNumber);

	}

	// fire page event
	this.firePage({currentPage:iPageNumber,previousPage:iCurrentPage});

	// return instance for chaining
	return this;

};



/*
 * OVERRIDE OF SETTERS
 */

/**
 * Setter for property <code>numberOfRows</code>.
 *
 * Default value is <code>5</code>
 *
 * @param {int} iNumberOfRows  new value for property <code>numberOfRows</code>
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.setNumberOfRows = function(iNumberOfRows) {

	// change property without setting suppress rendering flag
	this.setProperty("numberOfRows", iNumberOfRows);

	// child controls might need a re-render after this change
	this.updateChildControls();

	// return instance to allow chaining
	return this;

};

/**
 * Setter for property <code>currentPage</code>.
 *
 * @param {int} iCurrentPage  new value for property <code>currentPage</code>
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.setCurrentPage = function(iCurrentPage) {

	// invalidate with this update
	this.setProperty("currentPage", iCurrentPage);

	// child controls might need a re-render after this change
	this.updateChildControls();

	// return instance to allow chaining
	return this;

};

/**
 * Override the default behavior of <code>setShowMoreSteps</code> to update the
 * paging mode flag. Any change to the paging mode flag will result in the current
 * page being set to the first page.
 *
 * @param {int} iShowMoreSteps  new value for property <code>showMoreSteps</code>
 * @return {sap.ui.commons.RowRepeater} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.commons.RowRepeater.prototype.setShowMoreSteps = function(iShowMoreSteps) {

	// calculate new paging mode by looking at step size
	var bNewPagingMode = iShowMoreSteps>0 ? false : true;

	// the state is to be reset if the mode changes
	if(bNewPagingMode!==this.bPagingMode) {
		this.bPagingMode = bNewPagingMode;
		this.setCurrentPage(1);
	}


	// set the property allowing a re-rendering of the row repeater
	this.setProperty("showMoreSteps", iShowMoreSteps);
	return this;

};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.insertRow = function(oRow, iIndex) {
	this.insertAggregation("rows", oRow, iIndex);
	this.updateChildControls();
	return this;
};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.addRow = function(oRow) {
	this.addAggregation("rows", oRow);
	this.updateChildControls();
	return this;
};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.removeRow = function(vElement) {
	this.removeAggregation("rows", vElement);
	this.updateChildControls();
	return this;
};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.removeAllRows = function() {
	this.removeAllAggregation("rows");
	this.updateChildControls();
	return this;
};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.destroyRows = function() {
	this.destroyAggregation("rows");
	this.updateChildControls();
	return this;
};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.insertFilter = function(oFilter, iIndex) {

	// insert a button into the filter toolbar's aggregation
	var oToolbar = this.getAggregation("filterToolbar");
	var sFilterId = oFilter.getId();
	var oButton = new sap.ui.commons.Button({text:oFilter.getText(),icon:oFilter.getIcon(),tooltip:oFilter.getTooltip(),press:[function(){this.applyFilter(sFilterId);},this]});
	oToolbar.insertItem(oButton,iIndex);

	this.insertAggregation("filters", oFilter, iIndex);
	return this;

};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.addFilter = function(oFilter) {

	// add a button to the filter toolbar's aggregation
	var oToolbar = this.getAggregation("filterToolbar");
	var sFilterId = oFilter.getId();
	var oButton = new sap.ui.commons.Button({text:oFilter.getText(),icon:oFilter.getIcon(),tooltip:oFilter.getTooltip(),press:[function(){this.applyFilter(sFilterId);},this]});
	oToolbar.addItem(oButton);

	this.addAggregation("filters", oFilter);
	return this;
};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.removeFilter = function(vElement) {

	// remove button from toolbar
	var oToolbar = this.getAggregation("filterToolbar");
	oToolbar.removeItem(vElement);

	return this.removeAggregation("filters", vElement);
};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.removeAllFilters = function() {

	// remove all buttons from toolbar
	var oToolbar = this.getAggregation("filterToolbar");
	oToolbar.removeAllItems();

	return this.removeAllAggregation("filters");
};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.destroyFilters = function() {

	// remove all buttons from toolbar
	var oToolbar = this.getAggregation("filterToolbar");
	oToolbar.removeAllItems();

	this.destroyAggregation("filters");
	return this;
};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.insertSorter = function(oSorter, iIndex) {

	// add a button to the sorter toolbar's aggregation
	var oToolbar = this.getAggregation("sorterToolbar");
	var sSorterId = oSorter.getId();
	var oButton = new sap.ui.commons.Button({text:oSorter.getText(),icon:oSorter.getIcon(),tooltip:oSorter.getTooltip(),press:[function(){this.triggerSort(sSorterId);},this]});
	oToolbar.insertItem(oButton,iIndex);

	this.insertAggregation("sorters", oSorter, iIndex);
	return this;
};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.addSorter = function(oSorter) {

	// add a button to the sorter toolbar's aggregation
	var oToolbar = this.getAggregation("sorterToolbar");
	var sSorterId = oSorter.getId();
	var oButton = new sap.ui.commons.Button({text:oSorter.getText(),icon:oSorter.getIcon(),tooltip:oSorter.getTooltip(),press:[function(){this.triggerSort(sSorterId);},this]});
	oToolbar.addItem(oButton);

	this.addAggregation("sorters", oSorter);
	return this;
};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.removeSorter = function(vElement) {

	// remove button from toolbar
	var oToolbar = this.getAggregation("sorterToolbar");
	oToolbar.removeItem(vElement);

	return this.removeAggregation("sorters", vElement);
};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.removeAllSorters = function() {

	// remove all buttons from toolbar
	var oToolbar = this.getAggregation("sorterToolbar");
	oToolbar.removeAllItems();

	return this.removeAllAggregation("sorters");
};


/* refer to generated documentation */
sap.ui.commons.RowRepeater.prototype.destroySorters = function() {

	// remove all buttons from toolbar
	var oToolbar = this.getAggregation("sorterToolbar");
	oToolbar.removeAllItems();

	this.destroyAggregation("sorters");
	return this;
};


/*
 * ANIMATION METHODS
 */

sap.ui.commons.RowRepeater.prototype.startPagingAnimation = function() {

	// local variables
	var oCore = sap.ui.getCore();
	var oRenderManager = oCore.getRenderManager();
	var sId = this.getId();
	var iPageFrom = this.iPreviousPage;
	var iPageTo = this.getCurrentPage();
	var iNumberOfRows = this.getNumberOfRows();
	var iStartIndex = (iPageTo-1) * iNumberOfRows;
	var aRows = this.getRows();
	var iCurrentVisibleRows = aRows.length>iNumberOfRows*iPageTo ? iNumberOfRows : aRows.length-iNumberOfRows*(iPageTo-1);
	var iLastPage = Math.ceil( aRows.length/iNumberOfRows );
	var n;

	// DOM elements
	var oDomCurrentLI;
	var oJQDomULFrom = jQuery(jQuery.sap.domById(sId+"-page_"+iPageFrom));
	var oDomBodyDIV = jQuery.sap.domById(sId+"-body");
	var oJQDomBodyDIV = jQuery(oDomBodyDIV);

	// fix the height on the body DIV to allow an animated height change
	oJQDomBodyDIV.css("height",oJQDomBodyDIV.outerHeight());

	// create UL for new page
	var sDirection;
	if(sap.ui.getCore() && sap.ui.getCore().getConfiguration() && sap.ui.getCore().getConfiguration().getRTL()) {
		sDirection = (iPageTo<iPageFrom) ? "left" : "right";
	}else{
		sDirection = (iPageTo<iPageFrom) ? "right" : "left";
	}
	var sStyleString = "\"top:-" + oJQDomULFrom.outerHeight(true) + "px;" + sDirection + ":" + oJQDomULFrom.outerWidth(true) + "px;\"";
	jQuery("<ul id=\"" + sId + "-page_" + iPageTo + "\" class=\"sapUiRrPage\" style=" + sStyleString + "/>").appendTo(oDomBodyDIV);
	var oDomULTo = oDomBodyDIV.lastChild;
	var oJQDomULTo = jQuery(oDomULTo);
	for( n=iStartIndex; n<iStartIndex+iCurrentVisibleRows; n++ ) {
		jQuery("<li id=\"" + sId + "-row_" + n + "\" class=\"sapUiRrRow\"/>").appendTo(oDomULTo);
		oDomCurrentLI =  oDomULTo.lastChild;
		oRenderManager.render(aRows[n], oDomCurrentLI);
	}

	// animate the paging effect
	if(sDirection==="right") {
		oJQDomULFrom.animate({right:-oJQDomULFrom.outerWidth(true)},"slow");
		oJQDomULTo.animate({right:0},"slow");
	} else {
		oJQDomULFrom.animate({left:-oJQDomULFrom.outerWidth(true)},"slow");
		oJQDomULTo.animate({left:0},"slow");
	}

	// animate the height change if number of displayed rows changes
	oJQDomBodyDIV.animate({height:oJQDomULTo.outerHeight(true)},"slow",jQuery.proxy(this.endPagingAnimation,this));

};


sap.ui.commons.RowRepeater.prototype.endPagingAnimation = function() {

	// local variables
	var sId = this.getId();

	// get all needed DOM objects
	var oDomDIV = jQuery.sap.domById(sId+"-body");
	var oDomOldUL = jQuery.sap.domById(sId+"-page_"+this.iPreviousPage);
	var oDomCurrentUL = jQuery.sap.domById(sId+"-page_"+this.getCurrentPage());
	var oJQDomCurrentUL = jQuery(oDomCurrentUL);

	// un-fix the height on DIV
	jQuery(oDomDIV).css("height","");

	// remove the old UL from DOM
	jQuery(oDomOldUL).remove();

	// remove positioning from new UL
	var sDirection;
	if(sap.ui.getCore() && sap.ui.getCore().getConfiguration() && sap.ui.getCore().getConfiguration().getRTL()) {
		sDirection = (this.getCurrentPage()<this.iPreviousPage) ? "left" : "right";
	}else{
		sDirection = (this.getCurrentPage()<this.iPreviousPage) ? "right" : "left";
	}
	oJQDomCurrentUL.css("top","");
	oJQDomCurrentUL.css(sDirection,"");

	// reset animation indicator
	this.sCurrentAnimation = null;

	// start new animation
	this.nextQueuedAnimation();

};


sap.ui.commons.RowRepeater.prototype.startResizeAnimation = function() {

	// variables
	var oRenderManager = sap.ui.getCore().getRenderManager();
	var iNewNumberOfRows = this.getNumberOfRows();
	var iOldNumberOfRows = this.iPreviousNumberOfRows;
	var sId = this.getId();
	var aRows = this.getRows();
	var iSizeDelta = 0;
	var n;

	// dom elements
	var oDomCurrentLI;
	var oDomBodyDIV = jQuery.sap.domById(sId+"-body");
	var oJQDomBodyDIV = jQuery(oDomBodyDIV);
	var oDomPageUL = jQuery.sap.domById(sId+"-page_"+this.getCurrentPage());

	// fix the height
	oJQDomBodyDIV.css("height",oJQDomBodyDIV.outerHeight());

	// check if control is growing or shrinking
	if(iNewNumberOfRows>iOldNumberOfRows) {

		// create all newly visible child elements, if size grows
		for( n=iOldNumberOfRows; n<iNewNumberOfRows; n++ ) {
			jQuery("<li id=\"" + sId + "-row_" + n + "\" class=\"sapUiRrRow\"/>").appendTo(oDomPageUL);
			oDomCurrentLI =  oDomPageUL.lastChild;
			oRenderManager.render(aRows[n], oDomCurrentLI);
		}

	} else {

		// measure controls to be removed and store them in array for later removal
		for( n=iNewNumberOfRows; n<iOldNumberOfRows; n++ ) {
			oDomCurrentLI = jQuery.sap.domById(sId+"-row_"+n);
			iSizeDelta -= jQuery( oDomCurrentLI ).outerHeight(true);
			this.aRemoveBuffer.push(oDomCurrentLI);
		}

	}

	// animate resize of container
	oJQDomBodyDIV.animate({height:jQuery(oDomPageUL).outerHeight(true)+iSizeDelta},"slow",jQuery.proxy(this.endResizeAnimation,this));

};


sap.ui.commons.RowRepeater.prototype.endResizeAnimation = function() {

	// get body DIV
	var oDomBodyDIV = jQuery.sap.domById(this.getId()+"-body");

	// remove LI element after shrinking
	while( this.aRemoveBuffer.length>0 ) {
		jQuery(this.aRemoveBuffer.pop()).remove();
	}

	// un-fix the height on DIV
	jQuery(oDomBodyDIV).css("height","");

	// reset animation indicator
	this.sCurrentAnimation = null;

	// start new animation
	this.nextQueuedAnimation();

};


sap.ui.commons.RowRepeater.prototype.nextQueuedAnimation = function() {

	// local variables
	var oNextAnimation, oLastQueuedAnimation;
	var iCounter = 1;
	var aQueue = this.aAnimationQueue;
	var iPageNumber, iNumberOfRows;

	// get first one
	if(aQueue.length>0) {
		oNextAnimation = aQueue.shift();
	}

	// if there are more in the queue of same name we try to summarize
	if(oNextAnimation && aQueue.length>0) {

		// remove all upcoming animations with same name
		while(aQueue[0]&&aQueue[0].name===oNextAnimation.name) {
			iCounter++;
			oLastQueuedAnimation = aQueue.shift();
		}

		// reaction depends of animation name
		if(iCounter>0) {
			switch(oNextAnimation.name) {
			case sap.ui.commons.RowRepeater.SHOW_MORE:
				// replace with resize of summarized size
				iNumberOfRows = Math.min(this.getRows().length,this.getNumberOfRows()+this.getShowMoreSteps()*iCounter);
				oNextAnimation = {	name:sap.ui.commons.RowRepeater.RESIZE,
						animationFunction:this.resize,
						args:[iNumberOfRows]};
				break;
			case sap.ui.commons.RowRepeater.RESIZE:
				// execute the last one and skip the ones before
				oNextAnimation = oLastQueuedAnimation;
				break;
			case sap.ui.commons.RowRepeater.FIRST_PAGE:
				// the animations are duplicates and can be droppped
				break;
			case sap.ui.commons.RowRepeater.LAST_PAGE:
				// the animations are duplicates and can be droppped
				break;
			case sap.ui.commons.RowRepeater.PREVIOUS_PAGE:
				// replace with goto page
				iPageNumber = Math.max(1,this.getCurrentPage()-iCounter);
				oNextAnimation = {	name:sap.ui.commons.RowRepeater.GOTO_PAGE,
						animationFunction:this.gotoPage,
						args:[iPageNumber]};
				break;
			case sap.ui.commons.RowRepeater.NEXT_PAGE:
				// replace with goto page
				iPageNumber = Math.min(Math.ceil(this.getRows().length/this.getNumberOfRows()),this.getCurrentPage()+iCounter);
				oNextAnimation = {	name:sap.ui.commons.RowRepeater.GOTO_PAGE,
						animationFunction:this.gotoPage,
						args:[iPageNumber]};
				break;
			case sap.ui.commons.RowRepeater.GOTO_PAGE:
				// execute the last one and skip the ones before
				oNextAnimation = oLastQueuedAnimation;
				break;
			}
		}

	}

	// finally execute
	if(oNextAnimation) {
		oNextAnimation.animationFunction.apply(this,oNextAnimation.args);
	}

};


/*
 * INTERNAL METHODS
 */

/**
 * Handle paging events from the Paginator(s)
 *
 * @private
 */
 sap.ui.commons.RowRepeater.prototype.paging = function(oEvent) {

	 switch(oEvent.getParameter("type")) {
		 case sap.ui.commons.PaginatorEvent.First:
			 this.firstPage();
			 break;
		 case sap.ui.commons.PaginatorEvent.Last:
			 this.lastPage();
			 break;
		 case sap.ui.commons.PaginatorEvent.Previous:
			 this.previousPage();
			 break;
		 case sap.ui.commons.PaginatorEvent.Next:
			 this.nextPage();
			 break;
		 case sap.ui.commons.PaginatorEvent.Goto:
			 this.gotoPage(oEvent.getParameter("targetPage"));
			 break;
	 }

 }

/**
 * Update the state of aggregated child controls inside this row repeater.
 *
 * @private
 */;
sap.ui.commons.RowRepeater.prototype.updateChildControls = function() {

	// local referenced to controls
	var oShowMoreButton, oPager;

	// local variables
	var bShowMoreEnabled;

	// only care about pagers if we are in paging mode, otherwise it is the showMore buttons
	if(this.bPagingMode) {

		// the pager is itself responsible for activation, just update the page info
		var iCurrentPage = this.getCurrentPage();
		var iLastPage = Math.ceil( this.getRows().length/this.getNumberOfRows() );
		if (this.getRows().length == 0){
			iLastPage = 1;
		}

		// update header pager
		oPager = this.getAggregation("footerPager");
		if(oPager) {
			oPager.setCurrentPage( iCurrentPage );
			oPager.setNumberOfPages( iLastPage );
		}

	} else {

		// show more buttons are only active if there are more lines to show
		bShowMoreEnabled = this.getRows().length > this.getNumberOfRows();

		// update header showMore button
		oShowMoreButton = this.getAggregation("headerShowMoreButton");
		if(oShowMoreButton) {
			oShowMoreButton.setEnabled(bShowMoreEnabled);
		}

		// update footer showMore button
		oShowMoreButton = this.getAggregation("footerShowMoreButton");
		if(oShowMoreButton) {
			oShowMoreButton.setEnabled(bShowMoreEnabled);
		}

	}

};


/**
 * Verify if the rows aggregation of this control is bound.
 */
sap.ui.commons.RowRepeater.prototype.isBound = function(sName) {
	return sap.ui.core.Element.prototype.isBound.call(this, sName || "rows");
};