/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides base class sap.ui.core.Control for all controls
jQuery.sap.declare("sap.ui.core.Control");
jQuery.sap.require("sap.ui.core.Element");
//jQuery.sap.require("sap.ui.core.RenderManager"); // cyclic

/**
 * Creates and initializes a new control with the given <code>sId</code> and settings.
 *
 * The set of allowed entries in the <code>mSettings</code> object depends on the concrete
 * subclass and is described there. See {@link sap.ui.core.Element} for a general description of this
 * argument.
 *
 * @param {string} [sId] optional id for the new control; generated automatically if no non-empty id is given
 *      Note: this can be omitted, no matter whether <code>mSettings</code> will be given or not!
 * @param {object} [mSettings] optional map/JSON-object with initial settings for the new control
 * @public
 *
 * @class Base Class for Controls.
 * @extends sap.ui.core.Element
 * @abstract
 * @author Martin Schaus, Daniel Brinkmann
 * @version 1.2.0
 */
sap.ui.core.Control = function(sId, mSettings) {

	// TODO initialization should happen in init
	// but many of the existing controls don't call super.init()
	// As a workaround I moved the initialization of bAllowTextSelection here
	// so that it doesn't overwrite settings in init() (e.g. ListBox)
	this.bAllowTextSelection = true;

	sap.ui.core.Element.apply(this,arguments);
	this.bOutput = this.getDomRef() != null; // whether this control has already produced output
};

// chain the prototypes
sap.ui.core.Control.prototype = jQuery.sap.newObject(sap.ui.core.Element.prototype);

/*
 * Describe class Control.
 */
sap.ui.core.Element.defineClass("sap.ui.core.Control", {
	"abstract" : true,
	baseType : "sap.ui.core.Element",
	publicMethods: ["placeAt", "attachBrowserEvent", "detachBrowserEvent"],
	library: "sap.ui.core",
	properties : {},
	aggregations : {},
	associations : {},
	events : {}
});

/*
 * Override clone() to be able to clone additional internal state
 * which is not stored in properties or aggregations.
 */
sap.ui.core.Control.prototype.clone = function() {
	var oClone = sap.ui.core.Element.prototype.clone.apply(this, arguments);

	if ( this.aBindParameters ) {
		for(var i=0, l=this.aBindParameters.length; i<l; i++) {
			var aParams = this.aBindParameters[i];
			oClone.attachBrowserEvent(aParams.sEventType, aParams.fnHandler, aParams.oListener !== this ? aParams.oListener : undefined);
		}
	}
	oClone.bAllowTextSelection = this.bAllowTextSelection;
	return oClone;
};

// must appear after clone() method and metamodel definition
jQuery.sap.require("sap.ui.core.CustomStyleClassSupport");
sap.ui.core.CustomStyleClassSupport.apply(sap.ui.core.Control.prototype);


/**
 * Checks whether the control is still active (part of the active DOM)
 *
 * @return {boolean} whether the control is still in the active DOM
 * @private
 */
sap.ui.core.Control.prototype.isActive = function() {
	return jQuery.sap.domById(this.sId) != null;
};

/**
 * Triggers rerendering of this element and its children.
 *
 * As <code>sap.ui.core.Element</code> "bubbles up" the invalidate, changes to children
 * potentially result in rerendering of the whole sub tree.
 * @protected
 */
sap.ui.core.Control.prototype.invalidate = function(oOrigin) {
	var oUIArea;
	if ( this.bOutput && (oUIArea = this.getUIArea()) ) {
		// if this control has been rendered before (bOutput)
		// and if it is contained in an UIArea (!!oUIArea)
		// then control re-rendering can be used (see UIArea.rerender() for details)
		//
		// The check for bOutput is necessary as the control
		// re-rendering needs to identify the previous rendering results.
		// Otherwise it wouldn't be able to replace them.
		oUIArea.addInvalidatedControl(this);
	} else {
		// else we bubble up the hierarchy
		var oParent = this.getParent();
		if (oParent && (
				this.bOutput /* && !this.getUIArea() */ ||
				/* !this.bOutput && */ !(this.getVisible && this.getVisible() === false))) {
			
			// Note: the two comments in the condition above show additional conditions
			//       that help to understand the logic. As they are always fulfilled,
			//       they have been omitted for better performance.
			//
			// If this control has a parent but either
			//  - has produced output before ('this.bOutput') but is not part of an UIArea (!this.getUIArea())
			//  - or if it didn't produce output (!this.bOutput') before and is/became visible
			// then invalidate the parent to request re-rendering
			//
			// The first commented condition is always true, otherwise the initial if condition
			// in this method would have been met. The second one must be true as well because of the
			// short evaluation logic of JavaScript. When bOutput is true the second half of the Or won't be processed.
			
			oParent.invalidate(this);
		}
	}
};

/**
 * Tries to replace its DOM reference by re-rendering.
 * @protected
 */
sap.ui.core.Control.prototype.rerender = function() {
	sap.ui.core.UIArea.rerenderControl(this);
};

/**
 * Defines whether the user can select text inside this control.
 * Defaults to <code>true</code> as long as this method has not been called.
 *
 * <b>Note:</b>This only works in IE and Safari; for Firefox the element's style must
 * be set to:
 * <pre>
 *   -moz-user-select: none;
 * </pre>
 * in order to prevent text selection.
 *
 * @param {boolean} whether to allow text selection or not
 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Control.prototype.allowTextSelection = function(bAllow) {
	this.bAllowTextSelection = bAllow;
	return this;
};

/**
 * The string given as "sStyleClass" will be added to the "class" attribute of this control's root HTML element.
 * 
 * This method is intended to be used to mark controls as being of a special type for which
 * special styling can be provided using CSS selectors that reference this style class name.
 * 
 * <pre>
 * Example:
 *    myButton.addStyleClass("myRedTextButton"); // add a CSS class to one button instance
 * 
 * ...and in CSS:
 *    .myRedTextButton {
 *       color: red;
 *    }
 * </pre>
 * 
 * This will add the CSS class "myRedTextButton" to the Button HTML and the CSS code above will then
 * make the text in this particular button red.
 * 
 * Only characters allowed inside HTML attributes are allowed.
 * Quotes are not allowed and this method will ignore any strings containing quotes.
 * Strings containing spaces are interpreted as ONE custom style class (even though CSS selectors interpret them
 * as different classes) and can only removed later by calling removeStyleClass() with exactly the
 * same (space-containing) string as parameter.
 * Multiple calls with the same sStyleClass will have no different effect than calling once.
 * If sStyleClass is null, the call is ignored.
 * 
 * @name sap.ui.core.Control.prototype.addStyleClass
 * @function
 *
 * @param {string} sStyleClass the CSS class name to be added
 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
 * @public
 */

/**
 * Removes the given string from the list of custom style classes that have been set previously.
 * Regular style classes like "sapUiBtn" cannot be removed.
 *
 * @name sap.ui.core.Control.prototype.removeStyleClass
 * @function
 * 
 * @param {string} sStyleClass the style to be removed
 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
 * @public
 */

/**
 * Returns true if the given style class string is valid and if this control has this style class set
 * via a previous call to addStyleClass().
 * 
 * @name sap.ui.core.Control.prototype.hasStyleClass
 * @function
 * 
 * @param {string} sStyleClass the style to check for
 * @type boolean
 * @return whether the given style has been set before
 * @public
 */


/**
 * Allows binding handlers for any native browser event to the root HTML element of this Control. This internally handles
 * DOM element replacements caused by re-rendering.
 *
 * IMPORTANT:
 * This should be only used as FALLBACK when the Control events do not cover a specific use-case! Always try using
 * SAPUI5 control events, as e.g. accessibility-related functionality is then provided automatically.
 * E.g. when working with a sap.ui.commons.Button, always use the Button's "press" event, not the native "click" event, because
 * "press" is also guaranteed to be fired when certain keyboard activity is supposed to trigger the Button.
 *
 * In the event handler, "this" refers to the Control - not to the root DOM element like in jQuery. While the DOM element can
 * be used and modified, the general caveats for working with SAPUI5 control DOM elements apply. In particular the DOM element
 * may be destroyed and replaced by a new one at any time, so modifications that are required to have permanent effect may not
 * be done. E.g. use Control.addStyleClass() instead if the modification is of visual nature.
 *
 * Use detachBrowserEvent() to remove the event handler(s) again.
 *
 * @param {string} [sEventType] A string containing one or more JavaScript event types, such as "click" or "blur".
 * @param {function} [fnHandler] A function to execute each time the event is triggered.
 * @param {Object} [oListener] The object, that wants to be notified, when the event occurs
 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Control.prototype.attachBrowserEvent = function(sEventType, fnHandler, oListener) {
	if (sEventType && (typeof(sEventType) === "string")) { // do nothing if the first parameter is empty or not a string
		if (fnHandler && typeof(fnHandler) === "function") {   // also do nothing if the second parameter is not a function
			// store the parameters for bind()
			if (!this.aBindParameters) {
				this.aBindParameters = [];
			}
			oListener = oListener || this;

			// FWE jQuery.proxy can't be used as it breaks our contract when used with same function but different listeners
			var fnProxy=function() { fnHandler.apply(oListener, arguments); };
			
			this.aBindParameters.push({
				sEventType: sEventType,
				fnHandler: fnHandler,
				oListener: oListener,
				fnProxy : fnProxy
			});

			// if control is rendered, directly call bind()
			this.$().bind(sEventType, fnProxy);
		}
	}

	return this;
};


/**
 * This method is used to remove event handlers which have been previously attached using sap.ui.core.Control.attachBrowserEvent().
 *
 * @param {string} [sEventType] A string containing one or more JavaScript event types, such as "click" or "blur".
 * @param {function} [fnHandler] The function that is to be no longer executed.
 * @public
 */
sap.ui.core.Control.prototype.detachBrowserEvent = function(sEventType, fnHandler, oListener) {
	if (sEventType && (typeof(sEventType) === "string")) { // do nothing if the first parameter is empty or not a string
		if (fnHandler && typeof(fnHandler) === "function") {   // also do nothing if the second parameter is not a function
			var $ = this.$(),i,oParamSet;
			oListener=oListener || this;
			
			// remove the bind parameters from the stored array
			if (this.aBindParameters) {
				for (i = this.aBindParameters.length - 1; i >= 0; i--) {
					oParamSet = this.aBindParameters[i];
					if ( oParamSet.sEventType === sEventType  && oParamSet.fnHandler === fnHandler  &&  oParamSet.oListener === oListener ) {
						this.aBindParameters.splice(i, 1);
						// if control is rendered, directly call unbind()
						$.unbind(sEventType, oParamSet.fnProxy);
					}
				}
			}

		}
	}

	return this;
};



/**
 * Returns a renderer for this control instance.
 *
 * It is retrieved using the RenderManager as done during rendering.
 *
 * @return {object} a Renderer suitable for this Control instance.
 * @protected
 */
sap.ui.core.Control.prototype.getRenderer = function () {
	//TODO introduce caching?
	return sap.ui.core.RenderManager.getRenderer(this);
};

/**
 * Puts <code>this</code> control into the specified container (<code>oRef</code>) at the given
 * position (<code>oPosition</code>).
 *
 * First it is checked whether <code>oRef</code> is a container element / control (has a
 * multiple aggregation with type <code>sap.ui.core.Control</code> and name 'content') or is an Id String
 * of such an container.
 * If this is not the case <code>oRef</code> can either be a Dom Reference or Id String of the UIArea
 * (if it does not yet exist implicitly a new UIArea is created),
 *
 * The <code>oPosition</code> can be one of the following:
 *
 *  - "first": The control is added as the first element to the container.
 *  - "last": The control is added as the last element to the container (default).
 *  - "only": All existing children of the container are removed (not destroyed!) and the control is added as new child.
 *  - index: The control is added at the specified index to the container.
 *
 * @param {String|DomRef|sap.ui.core.Control} oRef container into which the control should be put
 * @param {String|int} oPosition Describes the position where the control should be put into the container
 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Control.prototype.placeAt = function(oRef, oPosition) {
	var oCore = sap.ui.getCore();
	if(oCore.isInitialized()){
		// core already initialized, do it now

		// 1st try to resolve the oRef as a Container control
		var oContainer = oRef;
		if(typeof oContainer === "string"){
			oContainer = oCore.byId(oRef);
		}
		// if no container control is found use the corresponding UIArea
		var bIsUIArea = false;
		if(!(oContainer instanceof sap.ui.core.Element)) {
			oContainer = oCore.createUIArea(oRef);
			bIsUIArea = true;
		}

		if(!oContainer) {
			return;
		}

		if(!bIsUIArea){
			var oContentAggInfo = oContainer.getMetadata().getAllAggregations()["content"];
			var bContainerSupportsPlaceAt = true;
			if(oContentAggInfo){
				if(!oContentAggInfo.multiple || oContentAggInfo.type != "sap.ui.core.Control"){
					bContainerSupportsPlaceAt = false;
				}
			}else{
				//Temporary workaround for sap.ui.commons.AbsoluteLayout to enable placeAt even when no content aggregation is available. TODO: Find a proper solution
				if(!oContainer.addContent || !oContainer.insertContent || !oContainer.removeAllContent) {
					bContainerSupportsPlaceAt = false;
				}
			}
			if(!bContainerSupportsPlaceAt) {
				jQuery.sap.log.warning("placeAt cannot be processed because container "+oContainer+" does not have an aggregation 'content'.");
				return;
			}
		}

		if(typeof oPosition === "number"){
			oContainer.insertContent(this, oPosition);
		}else{
			oPosition = oPosition || "last"; //"last" is default
			switch(oPosition){
				case "last":
					oContainer.addContent(this);
					break;
				case "first":
					oContainer.insertContent(this, 0);
					break;
				case "only":
					oContainer.removeAllContent();
					oContainer.addContent(this);
					break;
				default:
					jQuery.sap.log.warning("Position "+oPosition+" is not supported for function placeAt.");
			}
		}
	}else{
		// core not yet initialized, defer execution
		var that = this;
		oCore.attachInitEvent(function () {
			that.placeAt(oRef, oPosition);
		});
	}
	return this;
};

/*
 * Event handling
 */

/**
 * Cancels user text selection if text selection is disabled for this control.
 * See the {@link #allowTextSelection} method.
 * @private
 */
sap.ui.core.Control.prototype.onselectstart = function (oBrowserEvent) {
	if(!this.bAllowTextSelection) {
		oBrowserEvent.preventDefault();
		oBrowserEvent.stopPropagation();
	}
};

/*
 * Rendering
 */

/**
 * Function is called before the rendering of the control is started.<br/>
 * Override this hook as you please.
 *
 * @function
 * @name sap.ui.core.Control.prototype.onBeforeRendering
 * @public
 */
//sap.ui.core.Control.prototype.onBeforeRendering = function() {};

/**
 * Function is called when the rendering of the control is completed. <br/>
 * Override this hook as you please.
 *
 * @function
 * @name sap.ui.core.Control.prototype.onAfterRendering
 * @public
 */
//sap.ui.core.Control.prototype.onAfterRendering = function() {};

/**
 * Gets the ID used for the "labelFor" attribute of the label
 * By default its the control ID
 * @public
 */
sap.ui.core.Control.prototype.getIdForLabel = function () {
	return this.getId();
};
