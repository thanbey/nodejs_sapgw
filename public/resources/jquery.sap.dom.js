/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides functionality related to DOM analysis and manipulation which is not provided by jQuery itself.
jQuery.sap.declare("jquery.sap.dom", false);

(function() {

	/**
	 * Shortcut for document.getElementById(...) with additionally an IE6/7 bug fixed.
	 * Used to replace the jQuery.sap.domById when running in IE < v8.
	 * 
	 * @param {String} sId the id of the DOM element to return
	 * @param {window} oWindow the window (optional)
	 * @return {DOMNode} the DOMNode identified by the given sId
	 * @private
	 */
	var domByIdInternal = function(sId, oWindow) {

		if (!oWindow) {
			oWindow = window;
		}
		if (!sId || sId=="") {
			return null;
		}

		var oDomRef = oWindow.document.getElementById(sId);
		
		// IE also returns the element with the name or id whatever is first
		// => the following line makes sure that this was the id
		if (oDomRef && oDomRef.id == sId) {
			return oDomRef;
		}

		// otherwise try to lookup the name
		var oRefs = oWindow.document.getElementsByName(sId);
		for (var i=0;i<oRefs.length;i++) {
			oDomRef = oRefs[i];
			if (oDomRef && oDomRef.id == sId) {
				return oDomRef;
			}
		}

		return null;

	};
	
	/**
	 * Shortcut for document.getElementById(...) with additionally an IE bug fixed.
	 *
	 * @param {String} sId The id of the DOM element to return
	 * @param {window} oWindow The window (optional)
	 * @return {DOMNode} The DOMNode identified by the given sId
	 * @public
	 * @since 0.9.0
	 */
	jQuery.sap.domById = jQuery.browser.msie && jQuery.browser.version < 8 ? domByIdInternal : function domById(sId, oWindow) {
		return sId ? (oWindow || window).document.getElementById(sId) : null;
	};


	/**
	 * Shortcut for jQuery("#" + id) with additionally the id being escaped properly.
	 * I.e.: returns the jQuery object for the DOM element with the given id
	 *
	 * Use this method instead of jQuery(...) if you know the argument is exactly one id and
	 * the id is not known in advance because it is in a variable (as opposed to a string
	 * constant with known content).
	 *
	 * @param {String} sId The id to search for and construct the jQuery object
	 * @param {DomNode} oContext The context DomNode
	 * @return {Object} The jQuery object for the DOM element identified by the given sId
	 * @public
	 * @since 0.9.1
	 */
	jQuery.sap.byId = function byId(sId, oContext) {
		var escapedId = "";
		if (sId) {
			escapedId = "#" + sId.replace(/(:|\.)/g,'\\$1');
		}
		return jQuery(escapedId, oContext);
	};
	
	
	/**
	 * Calls focus() on the given DOM element, but catches and ignores any errors that occur when doing so.
	 * (i.e. IE8 throws an error when the DOM element is invisible or disabled)
	 *  
	 * @param {DomNode} oDomRef The DOM element to focus (or null - in this case the method does nothing)
	 * @return {boolean} Whether the focus() command was executed without an error
	 * @public
	 * @since 1.1.2
	 */
	jQuery.sap.focus = function focus(oDomRef) {
		if (!oDomRef) return;
		try {
			oDomRef.focus();
		} catch (e) {
			var id = (oDomRef && oDomRef.id) ? " (ID: '" + oDomRef.id + "')" : "";
			jQuery.sap.log.warning("Error when trying to focus a DOM element" + id + ": " + e.message);
			return false;
		}
		return true;
	};


	/**
	 * Sets or gets the position of the cursor in an element that supports cursor positioning
	 *
	 * @param {int} iPos The cursor position to set (or no parameter to retrieve the cursor position)
	 * @return {int | jQuery} The cursor position (or the jQuery collection if the position has been set)
	 * @public
	 * @methodOf jQuery.prototype
	 * @name cursorPos
	 * @author SAP AG
	 * @since 0.9.0
	 */
	jQuery.fn.cursorPos = function cursorPos(iPos) {
		var len = arguments.length,
			oTextRange,iLength,
			sTagName,
			sType;
			
		// in jQuery > 1.6 attr() don't gives results for some property, instead there is a prop() method
		if (this.prop) {
			sTagName = this.prop("tagName");
			sType = this.prop("type");
		}else{
			sTagName = this.attr("tagName");
			sType = this.attr("type");
		}
	
		if( this.length === 1 && ((sTagName == "INPUT" && (sType == "text" || sType == "password"))
				|| sTagName == "TEXTAREA" )) {

			var oDomRef = this.get(0);

			if (len > 0) { // SET

				if (oDomRef.createTextRange) { // IE method
					oTextRange = oDomRef.createTextRange();
					var iMaxLength = oDomRef.value.length;

					if(iPos < 0 || iPos > iMaxLength) {
						iPos = iMaxLength;
					}
					if(oTextRange) {
						oTextRange.collapse();
						oTextRange.moveEnd("character",iPos);
						oTextRange.moveStart("character",iPos);
						oTextRange.select();
					}
				} else if (typeof(oDomRef.selectionStart) == "number") { // FF method
					oDomRef.focus();
					oDomRef.selectionStart = iPos;
					oDomRef.selectionEnd = iPos;
				}

				return this;
				// end of SET

			} else { // GET

				if (oDomRef.createTextRange) { //IE
					oTextRange = window.document.selection.createRange();
					var oCopiedTextRange = oTextRange.duplicate();
					// Logic in TEXTAREA and INPUT is different in IE -> check for element type
					if(oDomRef.tagName == "TEXTAREA"){
						oCopiedTextRange.moveToElementText(oDomRef);
						var oCheckTextRange = oCopiedTextRange.duplicate();
						iLength = oCopiedTextRange.text.length;

						// first check if cursor on last position
						oCheckTextRange.moveStart("character", iLength);
						if(oCheckTextRange.inRange(oTextRange)){
							iStart = iLength;
						}else{
							// find out cursor position using a bisection algorithm
							var iCheckLength = iLength;
							var iStart = 0;
							while(iLength > 1){
								iCheckLength = Math.round(iLength / 2);
								iStart = iStart + iCheckLength;

								oCheckTextRange = oCopiedTextRange.duplicate();
								oCheckTextRange.moveStart("character", iStart);
								if(oCheckTextRange.inRange(oTextRange)){
									//cursor is after or on iStart -> Length = not checked Length
									iLength = iLength - iCheckLength;

								}else{
									//cursor is before iStart  -> Length = checked Length
									iStart = iStart - iCheckLength;
									iLength = iCheckLength;
								}
							}
						}
						return iStart;
					} else if (oCopiedTextRange.parentElement() === oDomRef) {
						// ensure there is only the cursor and not the range (as this would create erroneous position)!
						oCopiedTextRange.collapse();
						// now, move the selection range to the beginning of the inputField and simply get the selected range's length
						var iLength = oDomRef.value.length;
						oCopiedTextRange.moveStart('character', -iLength);
						return oCopiedTextRange.text.length;
					}
				} else if (typeof(oDomRef.selectionStart) == "number") { // Firefox etc.
					return oDomRef.selectionStart;
				}

				return -1;
			} // end of GET
		} else {
			// shouldn't really happen, but to be safe...
			return this;
		}
	};

	/**
	 * Sets the text selection in the first element of the collection
	 *
	 * @param {int} iStart Start position of the selection (inclusive)
	 * @param {int} iEnd End position of the selection (exclusive)
	 * @return {jQuery} The jQuery collection
	 * @public
	 * @methodOf jQuery.prototype
	 * @name selectText
	 * @author SAP AG
	 * @since 0.9.0
	 */
	jQuery.fn.selectText = function selectText(iStart, iEnd) {
		var oDomRef = this.get(0);

		if (oDomRef) {
			if(oDomRef.createTextRange) { // Firefox
				var oTextEditRange = oDomRef.createTextRange();
				oTextEditRange.collapse();
				oTextEditRange.moveStart('character', iStart);
				oTextEditRange.moveEnd('character', iEnd - iStart);
				oTextEditRange.select();
			} else if(typeof(oDomRef.selectionStart) == "number") { // Firefox
				oDomRef.selectionStart = iStart; // TODO: maybe need to decouple via setTimeout?
				oDomRef.selectionEnd = iEnd;
			}
		}

		return this;
	};


	/**
	 * Returns the outer HTML of the given HTML element
	 *
	 * @return {String} outer HTML
	 * @public
	 * @methodOf jQuery.prototype
	 * @name outerHTML
	 * @author SAP AG
	 * @since 0.9.0
	 */
	jQuery.fn.outerHTML = function outerHTML() {
		var oDomRef = this.get(0);

		if (oDomRef && oDomRef.outerHTML) {
			return jQuery.trim(oDomRef.outerHTML);
		} else {
			var doc = this[0] ? this[0].ownerDocument : document;

			var oDummy = doc.createElement("div");
			oDummy.appendChild(oDomRef.cloneNode(true));
			return oDummy.innerHTML;
		}
	};


	/**
	 * Returns whether oDomRefChild is oDomRefContainer or is contained in oDomRefContainer.
	 *
	 * This is a browser-independent version of the .contains method of Internet Explorer.
	 * For compatibility reasons it returns true if oDomRefContainer and oDomRefChild are equal.
	 *
	 * This method intentionally does not operate on the jQuery object, as the original jQuery.contains() 
	 * method also does not do so.
	 *
	 * @param {DOMNode} oDomRefContainer The container element
	 * @param {DOMNode} oDomRefChild The child element (must not be a text node, must be an element)
	 * @return {boolean} 'true' if oDomRefChild is contained in oDomRefContainer or oDomRefChild is oDomRefContainer
	 * @public
	 * @author SAP AG
	 * @since 0.9.0
	 */
	jQuery.sap.containsOrEquals = function containsOrEquals(oDomRefContainer, oDomRefChild) {
		if (oDomRefChild && oDomRefContainer && oDomRefChild != document && oDomRefChild != window) {
			return (oDomRefContainer === oDomRefChild) || jQuery.contains(oDomRefContainer, oDomRefChild);
		}
		return false;
	};


	/**
	 * Returns a rectangle describing the current visual positioning of the first DOM object in the collection
	 * (or null if no element was given)
	 *
	 * @return {object} An object with left, top, width and height
	 * @public
	 * @methodOf jQuery.prototype
	 * @name rect
	 * @author SAP AG
	 * @since 0.9.0
	 */
	jQuery.fn.rect = function rect() {
		var oDomRef = this.get(0);

		if (oDomRef) {
			// this should be available in all 'modern browsers'
			if (oDomRef.getBoundingClientRect) {
				var oClientRect = oDomRef.getBoundingClientRect();
				var oRect = { top : oClientRect.top,
						left : oClientRect.left,
						width : oClientRect.right - oClientRect.left,
						height : oClientRect.bottom - oClientRect.top };

				var oWnd = jQuery.sap.ownerWindow(oDomRef);
				oRect.left += jQuery(oWnd).scrollLeft();
				oRect.top += jQuery(oWnd).scrollTop();

				return oRect;
			} else {
				// IE6 and older; avoid crashing and give some hardcoded size
				return { top : 10, left : 10, width : oDomRef.offsetWidth, height : oDomRef.offsetWidth };
			}
		}
		return null;
	};


	/**
	 * Returns whether a point described by X and Y is inside this Rectangle's boundaries
	 *
	 * @param {int} iPosX
	 * @param {int} iPosY
	 * @return Whether X and Y are inside this Rectangle's boundaries
	 * @public
	 * @methodOf jQuery.prototype
	 * @name rectContains
	 * @author SAP AG
	 * @since 0.18.0
	 */
	jQuery.fn.rectContains = function rectContains(iPosX, iPosY) {
		jQuery.sap.assert(!isNaN(iPosX), "iPosX must be a number");
		jQuery.sap.assert(!isNaN(iPosY), "iPosY must be a number");

		var oRect = this.rect();

		if (oRect) {
			
			return iPosX >= oRect.left
				&& iPosX <= oRect.left + oRect.width
				&& iPosY >= oRect.top
				&& iPosY <= oRect.top + oRect.height;

		}
		return false;
	};


	/**
	 * Returns true if the first element has a set tabindex
	 *
	 * @return {boolean} If the first element has a set tabindex
	 * @public
	 * @methodOf jQuery.prototype
	 * @name hasTabIndex
	 * @author SAP AG
	 * @since 0.9.0
	 */
	jQuery.fn.hasTabIndex = function hasTabIndex() {
		var oDomRef = this.get(0);
		var iTabIndex = jQuery(oDomRef).attr("tabIndex");
		return !isNaN(iTabIndex) && iTabIndex >= 0;
	};


	/**
	 * Returns the first focusable domRef in a given container (the first element of the collection)
	 *
	 * @return {DOMNode} The domRef
	 * @public
	 * @methodOf jQuery.prototype
	 * @name firstFocusableDomRef
	 * @author SAP AG
	 * @since 0.9.0
	 */
	jQuery.fn.firstFocusableDomRef = function firstFocusableDomRef() {
		var oContainerDomRef = this.get(0);
		var visibilityHiddenFilter = function (idx){return jQuery(this).css("visibility") == "hidden";};
		if (!oContainerDomRef || jQuery(oContainerDomRef).is(':hidden') ||
				jQuery(oContainerDomRef).filter(visibilityHiddenFilter).length == 1) {
			return null;
		}

		var oCurrDomRef = oContainerDomRef.firstChild,
			oDomRefFound = null;

		while (oCurrDomRef) {
			if(oCurrDomRef.nodeType == 1 && jQuery(oCurrDomRef).is(':visible')) {
				if (jQuery(oCurrDomRef).hasTabIndex()) {
					return oCurrDomRef;
				}

				if(oCurrDomRef.childNodes) {
					oDomRefFound = jQuery(oCurrDomRef).firstFocusableDomRef();
					if(oDomRefFound) {
						return oDomRefFound;
					}
				}
			}
			oCurrDomRef = oCurrDomRef.nextSibling;
		}

		return null;
	};


	/**
	 * Returns the last focusable domRef in a given container
	 *
	 * @return {DOMNode} The last domRef
	 * @public
	 * @methodOf jQuery.prototype
	 * @name lastFocusableDomRef
	 * @author SAP AG
	 * @since 0.9.0
	 */
	jQuery.fn.lastFocusableDomRef = function lastFocusableDomRef() {
		var oContainerDomRef = this.get(0);
		var visibilityHiddenFilter = function (idx){return jQuery(this).css("visibility") == "hidden";};
		if (!oContainerDomRef || jQuery(oContainerDomRef).is(':hidden') ||
				jQuery(oContainerDomRef).filter(visibilityHiddenFilter).length == 1) {
			return null;
		}

		var oCurrDomRef = oContainerDomRef.lastChild,
			oDomRefFound = null;

		while (oCurrDomRef) {
			if(oCurrDomRef.nodeType == 1 && jQuery(oCurrDomRef).is(':visible')) {
				if(oCurrDomRef.childNodes) {
					oDomRefFound = jQuery(oCurrDomRef).lastFocusableDomRef();
					if(oDomRefFound) {
						return oDomRefFound;
					}
				}

				if (jQuery(oCurrDomRef).hasTabIndex()) {
					return oCurrDomRef;
				}
			}
			oCurrDomRef = oCurrDomRef.previousSibling;
		}

		return null;
	};
	
	
	/**
	 * Sets or returns the scrollLeft value of the first element in the given jQuery collection in right-to-left mode.
	 * Precondition: The element is rendered in RTL mode.
	 * 
	 * Reason for this method is that the major browsers use three different values for the same scroll position when in RTL mode.
	 * This method hides those differences and returns/applies the same value that would be returned in LTR mode: The distance in px 
	 * how far the given container is scrolled away from the leftmost scroll position.
	 * 
	 * Returns "undefined" if no element and no iPos is given.
	 * 
	 * @return {jQuery | int} The jQuery collection if iPos is given, otherwise the scroll position, counted from the leftmost position
	 * @public
	 * @methodOf jQuery.prototype
	 * @name scrollLeftRTL
	 * @author SAP AG
	 * @since 0.20.0
	 */
	jQuery.fn.scrollLeftRTL = function scrollLeftRTL(iPos) {
		var oDomRef = this.get(0);
		if (oDomRef) {
			
			if (iPos === undefined) { // GETTER code
				if (jQuery.browser.msie) {
					return oDomRef.scrollWidth - oDomRef.scrollLeft - oDomRef.clientWidth;
					
				} else if (jQuery.browser.webkit) {
					return oDomRef.scrollLeft;
	
				} else if (jQuery.browser.mozilla) {
					return oDomRef.scrollWidth + oDomRef.scrollLeft - oDomRef.clientWidth;
	
				} else {
					// unrecognized browser; it is hard to return a best guess, as browser strategies are very different, so return the actual value
					return oDomRef.scrollLeft;
				}
			
			} else { // SETTER code
				oDomRef.scrollLeft = jQuery.sap.denormalizeScrollLeftRTL(iPos);
				return this;
			}
		}
	};
	
	/**
	 * Returns the MIRRORED scrollLeft value of the first element in the given jQuery collection in right-to-left mode.
	 * Precondition: The element is rendered in RTL mode.
	 * 
	 * Reason for this method is that the major browsers return three different values for the same scroll position when in RTL mode.
	 * This method hides those differences and returns the value that would be returned in LTR mode if the UI would be mirrored horizontally:
	 * The distance in px how far the given container is scrolled away from the rightmost scroll position.
	 * 
	 * Returns "undefined" if no element is given.
	 * 
	 * @return {int} The scroll position, counted from the rightmost position
	 * @public
	 * @methodOf jQuery.prototype
	 * @name scrollRightRTL
	 * @author SAP AG
	 * @since 0.20.0
	 */
	jQuery.fn.scrollRightRTL = function scrollRightRTL() {
		var oDomRef = this.get(0);
		if (oDomRef) {
			
			if (jQuery.browser.msie) {
				return oDomRef.scrollLeft;
				
			} else if (jQuery.browser.webkit) {
				return oDomRef.scrollWidth - oDomRef.scrollLeft - oDomRef.clientWidth;

			} else if (jQuery.browser.mozilla) {
				return (-oDomRef.scrollLeft);

			} else {
				// unrecognized browser; it is hard to return a best guess, as browser strategies are very different, so return the actual value
				return oDomRef.scrollLeft;
			}
		}
	};
	
	
	/**
	 * For the given scrollLeft value this method returns the scrollLeft value as understood by the current browser in RTL mode.
	 * This value is specific to the given DOM element, as the computation may involve its dimensions.
	 * 
	 * So when oDomRef should be scrolled 2px from the leftmost position, the number "2" must be given as iNormalizedScrollLeft
	 * and the result of this method (which may be a large or even negative number, depending on the browser) can then be set as
	 * oDomRef.scrollLeft to achieve the desired (cross-browser-consistent) scrolling position.
	 * 
	 * This method does no scrolling on its own, it only calculates the value to set (so it can also be used for animations).
	 * 
	 * @param {int} iNormalizedScrollLeft The distance from the leftmost position to which the element should be scrolled
	 * @param {DOMNode} oDomRef The DOM element to which scrollLeft will be applied
	 * @return {int} The scroll position that must be set for the DOM element
	 * @public
	 * @name denormalizeScrollLeftRTL
	 * @author SAP AG
	 * @since 0.20.0
	 */
	jQuery.sap.denormalizeScrollLeftRTL = function byId(iNormalizedScrollLeft, oDomRef) {

		if (oDomRef) {
			if (jQuery.browser.msie) {
				return oDomRef.scrollWidth - oDomRef.clientWidth - iNormalizedScrollLeft;

			} else if (jQuery.browser.webkit) {
				return iNormalizedScrollLeft;

			} else if (jQuery.browser.mozilla) {
				return oDomRef.clientWidth + iNormalizedScrollLeft - oDomRef.scrollWidth;

			} else {
				// unrecognized browser; it is hard to return a best guess, as browser strategies are very different, so return the actual value
				return iNormalizedScrollLeft;
			}
		}
	};




	/*!
	 * The following function is taken from jQuery UI 1.8.5
	 *
	 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 * http://jquery.org/license
	 *
	 * http://docs.jquery.com/UI
	 */
	function visible( element ) {
		return !jQuery( element ).parents().andSelf().filter(function() {
			return jQuery.curCSS( this, "visibility" ) === "hidden" ||
			jQuery.expr.filters.hidden( this );
		}).length;
	}


	if (!jQuery.expr[":"].focusable) {
		/*!
		 * The following function is taken from jQuery UI 1.8.5
		 *
		 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
		 * Dual licensed under the MIT or GPL Version 2 licenses.
		 * http://jquery.org/license
		 *
		 * http://docs.jquery.com/UI
		 */
		jQuery.extend( jQuery.expr[ ":" ], {
			/**
			 * This defines the jQuery ":focusable" selector; it is also defined in jQuery UI. If already present, nothing is
			 * done here, so we will not overwrite any previous implementation.
			 * If jQuery UI is loaded later on, this implementation here will be overwritten by that one, which is fine,
			 * as it is semantically the same thing and intended to do exactly the same.
			 */
			focusable: function( element ) {
				var nodeName = element.nodeName.toLowerCase(),
					tabIndex = jQuery.attr( element, "tabindex" );
				if ( "area" === nodeName ) {
					var map = element.parentNode,
						mapName = map.name,
						img;
					if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
						return false;
					}
					img = jQuery( "img[usemap=#" + mapName + "]" )[0];
					return !!img && visible( img );
				}
				return ( /input|select|textarea|button|object/.test( nodeName )
					? !element.disabled
					: "a" == nodeName
						? element.href || !isNaN( tabIndex )
						: !isNaN( tabIndex ))
					// the element and all of its ancestors must be visible
					&& visible( element );
			}
		});
	}

	/**
	 * Gets the next parent DOM element with a given attribute and attribute value starting above the first given element
	 *
	 * @param {String} sAttibute Name of the attribute
	 * @param {String} sValue Value of the attribute (optional)
	 * @return {DOMNode} null or the DOM reference
	 * @public
	 * @methodOf jQuery.prototype
	 * @name parentByAttribute
	 * @author SAP AG
	 * @since 0.9.0
	 */
	jQuery.fn.parentByAttribute = function parentByAttribute(sAttribute, sValue) {
		if (this.length>0) {
			if (sValue) {
				return this.first().parents("["+sAttribute+"='"+sValue+"']").get(0);
			} else {
				return this.first().parents("["+sAttribute+"]").get(0);
			}
		}
	};


	/**
	 * Returns the window reference for a DomRef
	 *
	 * @param {DOMNode} oDomRef The DOM reference
	 * @return {window} Window reference
	 * @public
	 * @since 0.9.0
	 */
	jQuery.sap.ownerWindow = function ownerWindow(oDomRef){
		if (oDomRef.ownerDocument.parentWindow) {
			return oDomRef.ownerDocument.parentWindow;
		}
		return oDomRef.ownerDocument.defaultView;
	};

}());
