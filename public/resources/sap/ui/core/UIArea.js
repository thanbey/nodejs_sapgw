/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.core.UIArea
jQuery.sap.declare("sap.ui.core.UIArea");
jQuery.sap.require("jquery.sap.ui");
jQuery.sap.require("sap.ui.base.EventProvider");
jQuery.sap.require("sap.ui.core.Element");

/**
 * @class An area in a page that hosts a tree of UI elements.
 *
 * Provides means for event-handling, rerendering, etc.
 *
 * @extends sap.ui.base.EventProvider
 * @author Daniel Brinkmann, Martin Schaus
 * @version 1.2.0
 * @param {sap.ui.Core}
 *            oCore internal API of the <core>Core</code> that manages this UIArea
 * @param {object}
 *            [oRootNode] reference to the Dom Node that should be 'hosting' the UI Area.
 * @public
 */
sap.ui.core.UIArea = function(oCore, oRootNode) {
	if(arguments.length === 0) {
		return;
	}
	sap.ui.base.EventProvider.apply(this);

	//TODO we could get rid of oCore here, if we wanted to...
	this.oCore = oCore;
	this.bLocked = false;
	this.bInitial = true;
	this.aContentToRemove = [];
	this.oModels = {};
	this.iSuppressInvalidate = 0;

	this.mAggregations = {}; //Use the aggregation functionality of sap.ui.core.Element

	this.bNeedsRerendering = false;
	if (oRootNode != null) {
		this.setRootNode(oRootNode);
		// Figure out whether UI Area is pre-rendered (server-side JS rendering)!
		this.bNeedsRerendering = this.bNeedsRerendering && !jQuery.sap.domById(oRootNode.id + "-Init");
	}
	this.mInvalidatedControls = {};

	if(!this.bNeedsRerendering) {
		this.oRenderControl = null;
	} else {
		// Core needs to be notified about an invalid UIArea
		this.oCore.addInvalidatedUIArea(this);
	}

};
sap.ui.core.UIArea.prototype = jQuery.sap.newObject(sap.ui.base.EventProvider.prototype);
sap.ui.base.Object.defineClass("sap.ui.core.UIArea", {
		// ---- object ----
		baseType : "sap.ui.base.EventProvider",
		publicMethods : ["getId", "setRootNode", "getRootNode", "setRootControl", "getRootControl", "getContent", "insertContent", "addContent", "removeContent", "removeAllContent", "indexOfContent", "destroyContent", "lock", "unlock", "isLocked", "getSavedContent", "setModel", "getModel", "hasModel"]
	});

sap.ui.core.UIArea.M_EVENTS = {};

//Use the aggregation functionality of sap.ui.core.Element
sap.ui.core.UIArea.prototype.getAggregation = sap.ui.core.Element.prototype.getAggregation;
sap.ui.core.UIArea.prototype.insertAggregation = sap.ui.core.Element.prototype.insertAggregation;
sap.ui.core.UIArea.prototype.addAggregation = sap.ui.core.Element.prototype.addAggregation;
sap.ui.core.UIArea.prototype.removeAggregation = sap.ui.core.Element.prototype.removeAggregation;
sap.ui.core.UIArea.prototype.removeAllAggregation = sap.ui.core.Element.prototype.removeAllAggregation;
sap.ui.core.UIArea.prototype.indexOfAggregation = sap.ui.core.Element.prototype.indexOfAggregation;
sap.ui.core.UIArea.prototype.destroyAggregation = sap.ui.core.Element.prototype.destroyAggregation;

/**
 * Returns whether rerendering is currently suppressed on this UIArea
 * @return boolean
 * @protected
 */
sap.ui.core.UIArea.prototype.isInvalidateSuppressed = function() {
	return this.iSuppressInvalidate > 0;
};

/**
 * Returns this <code>UIArea</code>'s id (as determined from provided RootNode).
 * @return {string} id of this UIArea
 * @public
 *
 * TODO what is this needed for? ID can change and getRootNode() is also there...
 * Is this part of "UI area is like an Element" contract?
 */
sap.ui.core.UIArea.prototype.getId = function() {
	return this.oRootNode ? this.oRootNode.id : null;
};

/**
 * Returns this UI area. Needed to stop recursive calls from an element to its parent.
 *
 * @return {sap.ui.core.UIArea} this
 * @protected
 */
sap.ui.core.UIArea.prototype.getUIArea = function() {
	return this;
};

/**
 * Allows setting the Root Node hosting this instance of <code>UIArea</code>.<br/> The Dom Ref must have an Id that
 * will be used as Id for this instance of <code>UIArea</code>.
 *
 * @param {object}
 *            oRootNode the hosting Dom Ref for this instance of <code>UIArea</code>.
 * @public
 */
sap.ui.core.UIArea.prototype.setRootNode = function(oRootNode) {
	if(this.oRootNode === oRootNode) {
		return;
	}

	// oRootNode must either be empty or must be a DOMElement and must not be root node of some other UIArea
	jQuery.sap.assert(!oRootNode || (oRootNode.nodeType === 1 && !jQuery(oRootNode).attr("data-sap-ui-area")), "UIArea root node must be a DOMElement");

	//TODO IS there something missing
	if(this.oRootNode) {
		this._ondetach();
	}

	this.oRootNode = oRootNode;
	if ( this.getContent().length > 0 ) {
	  this.invalidate();
	}

	if(this.oRootNode) {
		// prepare eventing
		this._onattach();
	}
};

/**
 * Returns the Root Node hosting this instance of <code>UIArea</code>.
 *
 * @return {DOMNode} the Root Node hosting this instance of <code>UIArea</code>.
 * @public
 */
sap.ui.core.UIArea.prototype.getRootNode = function() {
	return this.oRootNode;
};

/**
 * Sets the root control to be displayed in this UIArea.
 *
 * First, all old content controls (if any) will be detached from this UIArea (e.g. their parent
 * relationship to this UIArea will be cut off). Then the parent relationship for the new
 * content control (if not empty) will be set to this UIArea and finally, the UIArea will
 * be marked for re-rendering.
 *
 * The real re-rendering happens whenever the re-rendering is called. Either implicitly
 * at the end of any control event or by calling sap.ui.getCore().applyChanges().
 *
 * @param {sap.ui.base.Interface | sap.ui.core.Control}
 *            oRootControl the Control that should be the Root for this <code>UIArea</code>.
 * @public
 * @deprecated use functions <code>removeAllContent</code> and <code>addContent</code> instead
 */
sap.ui.core.UIArea.prototype.setRootControl = function(oRootControl) {
	this.removeAllContent();
	this.addContent(oRootControl);
};

/**
 * Returns the content control of this <code>UIArea</code> at the specified index.
 * If no index is given the first content control is returned.
 *
 * @param {int} idx index of the control in the content of this <code>UIArea</code>
 * @return {sap.ui.core.Control} the content control of this <code>UIArea</code> at the specified index.
 * @public
 * @deprecated use function <code>getContent</code> instead
 */
sap.ui.core.UIArea.prototype.getRootControl = function(idx) {
	var aContent = this.getContent();
	if(aContent.length > 0){
		if(idx >=0 && idx < aContent.length) {
			return aContent[idx];
		}
		return aContent[0];
	}
	return null;
};

sap.ui.core.UIArea.prototype._addRemovedContent = function(oDomRef) {
	if(this.oRootNode && oDomRef) {
		this.aContentToRemove.push(oDomRef);
	}
};

/**
 * Getter for aggregation <code>content</code>.<br/>
 *
 * @return {sap.ui.core.Control[]}
 * @public
 */
sap.ui.core.UIArea.prototype.getContent = function() {
	return this.getAggregation("content", []);
};

/**
 * Inserts a content into the aggregation named <code>content</code>.
 *
 * @param {sap.ui.core.Control}
 *          oContent the content to insert; if empty, nothing is inserted
 * @param {int}
 *			iIndex the <code>0</code>-based index the content should be inserted at; for
 *             a negative value of <code>iIndex</code>, the content is inserted at position 0; for a value
 *             greater than the current size of the aggregation, the content is inserted at
 *             the last position
 * @return {sap.ui.core.UIArea} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.UIArea.prototype.insertContent = function(oContent, iIndex) {
	this.insertAggregation("content", oContent, iIndex);
	return this;
};

/**
 * Adds some content <code>oContent</code>
 * to the aggregation named <code>content</code>.
 *
 * @param {sap.ui.core.Control}
 *            oContent the content to add; if empty, nothing is inserted
 * @return {sap.ui.core.UIArea} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.UIArea.prototype.addContent = function(oContent, _bSuppressInvalidate) {
	this.addAggregation("content", oContent, _bSuppressInvalidate);
	// TODO this remains here just to make the UX3 Shell work which doesn't invalidate properly
	if ( _bSuppressInvalidate !== true ) {
		this.invalidate();
	}
	return this;
};

/**
 * Removes an content from the aggregation named <code>content</code>.
 *
 * @param {int | string | sap.ui.core.Control} vContent the content to remove or its index or id
 * @return {sap.ui.core.Control} the removed element or null
 * @public
 */
sap.ui.core.UIArea.prototype.removeContent = function(vContent, _bSuppressInvalidate) {
	var oContent = this.removeAggregation("content", vContent, _bSuppressInvalidate);
	if ( !_bSuppressInvalidate ) {
		var oDomRef;
		if(oContent && oContent.getDomRef) {
			oDomRef = oContent.getDomRef();
		}
		this._addRemovedContent(oDomRef);
		//this.invalidate();
	}
	return oContent;
};

/**
 * Removes all the controls in the aggregation named <code>content</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 */
sap.ui.core.UIArea.prototype.removeAllContent = function() {
	var aContent = this.removeAllAggregation("content");
	for(var idx=0; idx<aContent.length; idx++){
		var oDomRef;
		var oContent = aContent[idx];
		if(oContent && oContent.getDomRef) {
			oDomRef = oContent.getDomRef();
		}
		this._addRemovedContent(oDomRef);
	}
	//this.invalidate();
	return aContent;
};

/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>content</code>
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oContent the content whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 */
sap.ui.core.UIArea.prototype.indexOfContent = function(oContent) {
	return this.indexOfAggregation("content", oContent);
};

/**
 * Destroys all the content in the aggregation
 * named <code>content</code>.
 * @return {sap.ui.core.UIArea} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.UIArea.prototype.destroyContent = function() {
	var aContent = this.getContent();
	for(var idx=0; idx<aContent.length; idx++){
		var oDomRef;
		var oContent = aContent[idx];
		if(oContent && oContent.getDomRef) {
			oDomRef = oContent.getDomRef();
		}
		this._addRemovedContent(oDomRef);
	}
	this.destroyAggregation("content");
	//this.invalidate();
	return this;
};

/**
 * Removes the given child from this UI area, where it must have been the root
 * control.
 * @see sap.ui.core.Element#_removeChild
 * @see sap.ui.core.Element#setParent
 *
 * @param {sap.ui.core.Control}
 *            oChild the child element to be removed
 * @protected
 */
sap.ui.core.UIArea.prototype._removeChild = function(oChild) {
	var idx = this.indexOfContent(oChild);
	if(idx >=0){
		this.removeContent(idx);
	}
};

/**
 * Locks this instance of UIArea.
 *
 * Rerendering and eventing will not be active as long as no
 * {@link #unlock} is called.
 *
 * @public
 */
sap.ui.core.UIArea.prototype.lock = function() {
	this.bLocked = true;
};

/**
 * Un-Locks this instance of UIArea.
 *
 * Rerendering and eventing will now be enabled again.
 *
 * @public
 */
sap.ui.core.UIArea.prototype.unlock = function() {
	if ( this.bLocked && this.bNeedsRerendering ) {
		// While being locked, we might have ignored a call to rerender()
		// Therefore notify the Core (again)
		this.oCore.addInvalidatedUIArea(this);
	}
	this.bLocked = false;
};

/**
 * Returns the locked state of the <code>sap.ui.core.UIArea</code>
 * @type boolean
 * @return locked state
 * @public
 */
sap.ui.core.UIArea.prototype.isLocked = function () {
	return this.bLocked;
};

/**
 * Set the model for databinding
 * @param {sap.ui.model.Model} oModel
 * @param {string} [sName]
 * @public
 */
sap.ui.core.UIArea.prototype.setModel = function(oModel, sName) {
	this.oModels[sName] = oModel;
	this.updateBindings(sName);
};

/**
 * Get the model for databinding
 * @param {string} [sName]
 * @return {sap.ui.model.Model} oModel
 * @public
 */
sap.ui.core.UIArea.prototype.getModel = function(sName) {
	return this.oModels[sName] || this.oCore.getModel(sName);
};

/**
 * Check if a Model is set to the UI Area or to the Core
 * @return {boolean} true or false
 * @public
 */
sap.ui.core.UIArea.prototype.hasModel = function() {
	if (!jQuery.isEmptyObject(this.oModels) || this.oCore.hasModel()) {
		return true;
	} else {
		return false;
	}
};

/**
 * Provide getBindingContext, as UIArea can be parent of an element.
 * Always returns null.
 *
 * @protected
 */
sap.ui.core.UIArea.prototype.getBindingContext = function(){
	return null;
};

/**
 * Method is called by the core if a model is set to the core to update/recreate all bindings
 * for the UI Areas and its contents.
 *
 * @private
 */
sap.ui.core.UIArea.prototype.updateBindings = function(sName){
	jQuery.each(this.getContent(), function (i, oElement){
		// update binding context, for primary model only
		if (!sName){oElement.updateBindingContext();}
		// if the model changes, all bindings have to be recreated (at least those to the previous model)
		oElement.updateBindings(false, sName, true);
	});
};



// ###########################################################################
// Convenience for methods
// e.g. Process Events for inner Controls
// or figure out whether control is part of this area.
// ###########################################################################

/**
 * Checks whether the control is still valid (is in the DOM)
 *
 * @return {boolean} True if the control is still in the active DOM
 * @protected
 */
sap.ui.core.UIArea.prototype.isActive = function() {
	return jQuery.sap.domById(this.getId()) != null;
};

/**
 * Will be used as end-point for invalidate-bubbling from controls up their hierarchy.<br/> Triggers re-rendering of
 * the UIAreas content.
 * @protected
 */
sap.ui.core.UIArea.prototype.invalidate = function() {
	this.addInvalidatedControl(this);
};

/**
 * Notifies the UIArea about an just invalidated control.
 *
 * The UIArea internally decides whether to re-render just the modified
 * controls or the complete content. It also informs the Core when it
 * becomes invalid the first time.
 *
 * TODO this.oRenderControl is either NULL or THIS. change to boolean?!
 * @protected
 */
sap.ui.core.UIArea.prototype.addInvalidatedControl = function(oControl){
	if (this.oRenderControl == this) {
		return;
	}

	// inform the Core, if we are getting invalid now
	if ( !this.bNeedsRerendering ) {
		this.oCore.addInvalidatedUIArea(this);
	}

	var sId = oControl.getId();
	//check whether the control is already invalidated
	if (/*jQuery.inArray(oControl, this.getContent()) || */oControl == this ) {
		this.oRenderControl = this; //everything in this UIArea
		this.bNeedsRerendering = true;
		return;
	}
	if (this.mInvalidatedControls[sId]) {
		return;
	}
	if (!this.oRenderControl) {
		//add it to the list of controls
		this.mInvalidatedControls[sId] = oControl;
		this.bNeedsRerendering = true;
	}
};

sap.ui.core.UIArea.MAX_INVALIDATED_CHILDREN = 10000;

/**
 * TODO review and maybe refactor this complex algorithm
 * TODO documentation
 * @param force {boolean} true, if the rerendering of the UI area should be forced
 * @return {boolean} whether a redraw was necessary or not
 * @private
 */
sap.ui.core.UIArea.prototype.rerender = function(force){
	if (force) {
		this.bNeedsRerendering = true;
	}
	if ( this.bLocked || !this.bNeedsRerendering ) {
		return false;
	}

	if (this.oRenderControl == this) {
		if (this.oRootNode) {
			jQuery.sap.log.info("Rerendering of UI area: " + this.getId());

			// save old content
			sap.ui.core.RenderManager.preserveContent(this.oRootNode, /* bPreserveRoot */ false, /* bPreserveNodesWithId */ this.bInitial);
			this.bInitial = false;

			//First remove the old Dom nodes and then render the controls again
			var len = this.aContentToRemove.length;
			var oDomRef;
			for(var i=0; i<len; i++) {
				oDomRef = this.aContentToRemove[i];
				if ( oDomRef && !sap.ui.core.RenderManager.isPreservedContent(oDomRef) ) {
					jQuery(oDomRef).remove();
				}
			}
			this.aContentToRemove = [];

			var aContent = this.getContent();
			var len = aContent.length;

			var oDomRef;
			for(var i=0; i<len; i++){
				oDomRef = aContent[i].getDomRef();
				if(oDomRef && !sap.ui.core.RenderManager.isPreservedContent(oDomRef)) {
					jQuery(oDomRef).remove();
				}
			}

			for(var i=0; i<len; i++){
				this.oCore.oRenderManager.render(aContent[i], this.oRootNode, true);
			}
		} else { // cannot re-render now; wait!
			return false;
		}
	} else {
		var that = this;
		function isAncestorInvalidated(oAncestor) {
			while ( oAncestor && oAncestor !== that ) {
				if ( that.mInvalidatedControls.hasOwnProperty(oAncestor.getId()) ) {
					return true;
				}
				oAncestor = oAncestor.getParent();
			}
			return false;
		}
		for (var n in this.mInvalidatedControls) { // TODO for in skips some names in IE8!
			var oControl = this.oCore.byId(n);
			// CSN 0000834961 2011: control may have been destroyed since invalidation happened
			if ( oControl && !isAncestorInvalidated(oControl.getParent()) ) {
				oControl.rerender();
			}
		}

	}

	this.oRenderControl = null;
	this.mInvalidatedControls = {};
	this.bNeedsRerendering = false;

	return true;

};

/**
 * Rerenders the given control
 * @see sap.ui.core.Control.rerender()
 * @param oControl
 * @private
 */
sap.ui.core.UIArea.rerenderControl = function(oControl){
	var oDomRef = oControl ? oControl.getDomRef() : null;
	var oParentDomRef = oDomRef && oDomRef.parentNode; // remember parent here as preserveContent() might move the node!
	if(oParentDomRef){
		var uiArea = oControl.getUIArea();
		var rm = uiArea ? uiArea.oCore.oRenderManager : sap.ui.getCore().createRenderManager();
		jQuery.sap.log.info("Rerendering of control (using Core-RenderManager: "+(!!uiArea)+"): " + oControl.getId());
		sap.ui.core.RenderManager.preserveContent(oDomRef, /* bPreserveRoot */ true, /* bPreserveNodesWithId */ false);
		rm.render(oControl, oParentDomRef);
	} else {
		jQuery.sap.log.warning("Couldn't rerender '" + oControl.getId() + "', as its DOM location couldn't be determined");
	}
};

/**
 * Handles all incoming DOM events centrally and dispatches the event to the
 * registered event handlers.
 * @param {jQuery.Event} oEvent the jQuery event object
 * @private
 */
sap.ui.core.UIArea.prototype._handleEvent = function(/**event*/oEvent) {

	// execute the registered event handlers
	var oElement = null;

	// TODO: this should be the 'lowest' SAPUI5 Control of this very
	// UIArea instance's scope -> nesting scenario
	oElement = jQuery(oEvent.target).control(0);
	if (oElement == null ||
		// in case of a Dialog the getUIArea function of the element returns
		// "null" and in case of nested UIAreas we need to ensure that the
		// UIArea is the same => BUT in case of nested UIAreas in dialogs
		// this pattern will not work!
		// TODO: May be in nested UIAreas in the UIArea is set properly and not
		//       null like for the root UI Area of the dialog!
		// TODO: In case of PopUp control it could be that the event is handled
		//       by the static area where the getUIArea check fails e.g.
		//       this happens in the MenuButton.qunit.html within the test
		//       "Menu is hidden after click on a menuitem" so in this case
		//       we have to ignore this check in case of static area where
		//       nevertheless the items are rendered invisible!
		// REMARK: IN GENERAL WE SHOULD RETHINK THE getUIArea FUNCTION
		//         BECAUSE IN CASE OF NESETED UI AREAS WE NEED TO MAKE SURE TO
		//         CHECK IF THE EVENT OCCURED WITHIN THE SPECIFIC UIAREA
		(this.getId() != "sap-ui-static" && oElement.getUIArea() != null && oElement.getUIArea() != this)) {
		return;
	}

	// store the element on the event (aligned with jQuery syntax)
	oEvent.srcControl = oElement;

	// forward the control event:
	// if the control propagation has been stopped or the default should be
	// prevented then do not forward the control event.
	this.oCore._handleControlEvent(oEvent, this.getId());

	// if the UIArea or the Core is locked then we do not dispatch
	// any event to the control => but they will still be dispatched
	// as control event afterwards!
	if (this.bLocked || this.oCore.isLocked()) {
		return;
	}

	// retrieve the pseudo event types
	var aEventTypes = [];
	if(oEvent.getPseudoTypes){
		aEventTypes = oEvent.getPseudoTypes();
	}
	aEventTypes.push(oEvent.type);

	// dispatch the event to the controls (callback methods: onXXX)
	while (oElement && oElement instanceof sap.ui.core.Element && oElement.isActive() && !oEvent.isPropagationStopped()) {

		// for each event type call the callback method
		// if the execution should be stopped immediately
		// then no further callback method will be executed
		for (var i = 0, is = aEventTypes.length; i < is; i++) {
			var sType = aEventTypes[i];
			oEvent.type = sType;
			// ensure currenTarget is the DomRef of the handling Control
			oEvent.currentTarget = oElement.getDomRef();
			oElement._handleEvent(oEvent);
			if(oEvent.isImmediatePropagationStopped()) {
				break;
			}
		}

		// if the propagation is stopped do not bubble up further
		if(oEvent.isPropagationStopped()) {
			break;
		}

		// This is the (not that common) situation that the element was deleted in its own event handler.
		// i.e. the Element became 'inactive' (see Element#isActive())
		var oDomRef = oElement.getDomRef();
		if(!oDomRef) {
			continue;
		}

		// bubble up to the parent
		oDomRef = oDomRef.parentNode;
		oElement = null;

		// ensure we do not bubble the control tree higher than our rootNode
		while (oDomRef && oDomRef !== this.getRootNode()) {
			if (oDomRef.id) {
				oElement = jQuery(oDomRef).control(0);
				if (oElement) {
					break;
				}
			}
			oDomRef = oDomRef.parentNode;
		}

	}

	// reset previously changed currentTarget
	oEvent.currentTarget = this.getRootNode();

	// TODO: rethink about logging levels!

	// logging: propagation stopped
	if (oEvent.isPropagationStopped()) {
		jQuery.sap.log.debug("'" + oEvent.type + "' propagation has been stopped");
	}

	// logging: prevent the logging of some events and for others do some
	//          info logging into the console
	var sName = oEvent.type;
	if (sName!="mousemove" && sName!="mouseover" && sName!="scroll" && sName!="mouseout") {
		var oElem = jQuery(oEvent.target).control(0);
		if(oElem) {
			jQuery.sap.log.debug("Event fired: '" + oEvent.type + "' on " + oElem, "", "sap.ui.core.UIArea");
		}
		else {
			jQuery.sap.log.debug("Event fired: '" + oEvent.type + "'", "", "sap.ui.core.UIArea");
		}
	}

};

/*
* The onattach function is called when the Element is attached to the DOM
* @private
*/
sap.ui.core.UIArea.prototype._onattach = function() {

// TODO optimizations for 'matching event list' could be done here.
//	// create the events string (space separated list of event names):
//	// the first time a control is attached - it will determine the required
//	// events and store this information in the controls metadata which is
//	// shared across the control instances.
//	if (!this.getMetadata().sEvents) {
//
//		// shorten the access to the array of events and pseudo events
//		var aEv = jQuery.sap.ControlEvents;
//		var oPsEv = jQuery.sap.PseudoEvents;
//
//		// create the data structures for the event handler registration
//		this.sEvents = "";
//		var aEvents = [];
//
//		// check for pseudo events and register them for their relevant types
//		for (var evt in oPsEv) {
//				for (j = 0, js = oPsEv[evt].aTypes.length; j < js; j++) {
//					var type = oPsEv[evt].aTypes[j];
//					if (jQuery.inArray(type, aEvents) == -1) {
//						aEvents.push(type);
//					}
//				}
//		}
//
//		// check for events and register them
//		for (var i = 0, is = aEv.length; i < is; i++) {
//			var type = aEv[i];
//				if (jQuery.inArray(type, aEvents) == -1) {
//					aEvents.push(type);
//				}
//		}
//
//		// keep the list of events for the jQuery bind/unbind method
//		this.sEvents = aEvents.join(" ");
//
//		// cache the event handlers registry map
//		this.getMetadata().sEvents = this.sEvents;
//
//	} else {
//		// use the cached map of event handlers
//		this.sEvents = this.getMetadata().sEvents;
//	}

	// check for existing root node
	var oDomRef = this.getRootNode();
	if (oDomRef == null) {
		return;
	}

	//	mark the DOM as UIArea and bind the required events
	jQuery(oDomRef).attr("data-sap-ui-area", oDomRef.id).bind(jQuery.sap.ControlEvents.join(" "), jQuery.proxy(this._handleEvent, this));

};

/**
* The ondetach function is called when the Element is detached out of the DOM
* @private
*/
sap.ui.core.UIArea.prototype._ondetach = function() {

	// check for existing root node
	var oDomRef = this.getRootNode();
	if (oDomRef == null) {
		return;
	}

	// remove UIArea marker and unregister all event handlers of the control
	jQuery(oDomRef).removeAttr("data-sap-ui-area").unbind();

	// TODO: when optimizing the events => take care to unbind only the
	//       required. additionally consider not to remove other event handlers.
//	var ojQRef = jQuery(oDomRef);
//	if (this.sEvents) {
//		ojQRef.unbind(this.sEvents, this._handleEvent);
//	}
//
//	var oFH = this.oCore.oFocusHandler;
//	ojQRef.unbind("focus",oFH.onfocusin);
//	ojQRef.unbind("blur", oFH.onfocusout);

};