/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/**
 * @overview Initialization for the SAP UI Library
 *
 * This module creates the main SAP namespaces {@link sap} and automatically
 * registers it to the OpenAjax hub if that exists.
 *
 * This class provides method {@link #namespace} to register namespaces to the
 * SAP UI Library.
 *
 * @sample
 * Ensures a control can be used afterwards but does not load immediately
 * sap.ui.lazyRequire("sap.ui.core/Control");
 * sap.ui.lazyRequire("sap.ui.commons/Button");
 *
 * @version 1.2.0
 * @author  Martin Schaus, Daniel Brinkmann
 * @public
 */

/*global OpenAjax */// declare unusual global vars for JSLint/SAPUI5 validation

// Register to the OpenAjax Hub if it exists
if (window.OpenAjax && window.OpenAjax.hub) {
	OpenAjax.hub.registerLibrary("sap", "http://www.sap.com/", "0.1", {});
}

jQuery.sap.declare("sap.ui.Global");
jQuery.sap.require("jquery.sap.dom");

/**
 * Root namespace for JavaScript functionality provided by SAP AG.
 *
 * The <code>sap</code> namespace is automatically registered with the
 * OpenAjax hub if it exists.
 *
 * @version 1.2.0
 * @namespace
 * @public
 * @name sap
 */
if ( typeof window.sap !== "object" && typeof window.sap !== "function"  ) {
  window.sap = {};
}

/**
 * The <code>sap.ui</code> namespace is the central OpenAjax compliant entry
 * point for UI related JavaScript functionality provided by SAP.
 *
 * @version 1.2.0
 * @namespace
 * @name sap.ui
 * @public
 */
if ( typeof window.sap.ui !== "object") {
	window.sap.ui = {};
}
sap.ui = jQuery.extend(sap.ui, {
		/**
		 * @deprecated contained information was never used
		 */
		global: {
				resourceFolder: "js",
				debugMode: true,
				debugFolder: "dbg"
			},
		/**
		 * The version of the SAP UI Library
		 * @type string
		 */
		version: "1.2.0",
		buildinfo : { lastchange : "ac0573cb31439a02fc5c6a2a1c51f892b2664067 ", buildtime : "201201151748" }
	});

/**
 * Ensures that a given a namespace or hierarchy of nested namespaces exists in the
 * current <code>window</code>.
 *
 * @return {object} the innermost namespace of the hierarchy
 * @public
 * @static
 * @deprecated Use jQuery.sap.declare or jQuery.sap.getObject(...,0) instead
 */
sap.ui.namespace = function(sNamespace){

	jQuery.sap.assert(false, "sap.ui.namespace is long time deprecated and shouldn't be used");
	
	if (sNamespace === "sap.ui.global" || sNamespace.indexOf("sap.ui.global.") === 0) {
		jQuery.sap.log.fatal("Namespace 'sap.ui.global' is reserved and must not be used.");
	}

	return jQuery.sap.getObject(sNamespace, 0);
};

/**
 * Creates a lazy loading stub for a given class <code>sClassName</code>.
 *
 * If the class has been loaded already, nothing is done. Otherwise a stub object 
 * or constructor and - optionally - a set of stub methods are created.
 * All created stubs will load the corresponding module on execution 
 * and then delegate to their counterpart in the loaded module.   
 * 
 * When no methods are given or when the list of methods contains the special name
 * "new" (which is an operator can't be used as method name in JavaScript), then a 
 * stub <b>constructor</b> for class <code>sClassName</code> is created. 
 * Otherwise,  a plain object is created.
 * 
 * <b>Note</b>: Accessing any stub as a plain object without executing it (no matter 
 * whether it is a function or an object) won't load the module and therefore most like 
 * won't work as expected. This is a fundamental restriction of the lazy loader approach. 
 * It could only be fixed with JavaScript 1.5 features that are not available in all 
 * UI5 target browsers (e.g. not in IE8).
 *  
 * <b>Note</b>: As a side effect of this method, the namespace containing the given
 * class is created <b>immediately</b>.
 *
 * @param {string} sClassName Fully qualified name (dot notation) of the class that should be prepared
 * @param {string} [sMethods='new'] space separated list of additional (static) methods that should be created as stubs
 * @param {string} [sModuleName] name of the module to load, defaults to the class name
 * @public
 * @static
 */
sap.ui.lazyRequire = function(sClassName, sMethods, sModuleName) {

	jQuery.sap.assert(typeof sClassName === "string" && sClassName, "lazyRequire: sClassName must be a non-empty string");
	jQuery.sap.assert(!sMethods || typeof sMethods === "string", "lazyRequire: sMethods must be empty or a string");

	var sFullClass = sClassName.replace(/\//gi,"\."),
		iLastDotPos = sFullClass.lastIndexOf("."),
		sPackage = sFullClass.substr(0, iLastDotPos),
		sClass = sFullClass.substr(iLastDotPos + 1),
		oPackage = jQuery.sap.getObject(sPackage, 0),
		oClass = oPackage[sClass],
		aMethods = (sMethods || "new").split(" "),
		iConstructor = jQuery.inArray("new", aMethods);

	sModuleName = sModuleName || sFullClass;
	
	if (!oClass) {

		if ( iConstructor >= 0 ) {
	
			// Create dummy constructor which loads the class on demand
			oClass = function() {
				jQuery.sap.log.debug("lazy stub for '" + sFullClass + "' (constructor) called.");
				jQuery.sap.require(sModuleName);
				var oRealClass = oPackage[sClass];
				jQuery.sap.assert(typeof oRealClass === "function", "lazyRequire: oRealClass must be a function after loading");
				if ( oRealClass._sapUiLazyLoader ) {
					throw new Error("lazyRequire: stub '" + sFullClass + "'has not been replaced by module '" + sModuleName + "'");
				}

				// create a new instance and invoke the constructor
				var oInstance = jQuery.sap.newObject(oRealClass.prototype);
				var oResult = oRealClass.apply(oInstance, arguments);
				if (oResult && (typeof oResult === "function" || typeof oResult === "object")) {
					oInstance = oResult;
				}
				return oInstance;
			};
			// mark the stub as lazy loader 
			oClass._sapUiLazyLoader = true;
	
			aMethods.splice(iConstructor,1);
			
		} else {
	
			// Create dummy object
			oClass = {};
			
		}

		// remember the stub
		oPackage[sClass] = oClass;
		
	}
	

	// add stub methods to it
	jQuery.each(aMethods, function (i,sMethod) {
		// check whether method is already available
		if (!oClass[sMethod]) {
			oClass[sMethod] = function() {
				jQuery.sap.log.debug("lazy stub for '" + sFullClass + "." + sMethod + "' called.");
				jQuery.sap.require(sModuleName);
				var oRealClass = oPackage[sClass];
				jQuery.sap.assert(typeof oRealClass === "function" || typeof oRealClass === "object", "lazyRequire: oRealClass must be a function or object after loading");
				jQuery.sap.assert(typeof oRealClass[sMethod] === "function", "lazyRequire: method must be a function");
				if (oRealClass[sMethod]._sapUiLazyLoader ) {
					throw new Error("lazyRequire: stub '" + sFullClass + "." + sMethod + "' has not been replaced by loaded module '" + sModuleName + "'");
				}
				return oRealClass[sMethod].apply(oRealClass, arguments);
			};
			oClass[sMethod]._sapUiLazyLoader = true;
		}
	});
	
};

/**
 * @static
 * @public
 */
sap.ui.resource = function(sLibraryName, sResourcePath) {
	return jQuery.sap.getModulePath(sLibraryName, '/') + sResourcePath;
};

/**
 * Redirects access to resources that are part of the given namespace to a location
 * relative to the assumed <b>application root folder</b>.
 * 
 * Any UI5 managed resource (view, controller, control, JavaScript module, CSS file, etc.)
 * whose resource name starts with <code>sNamespace</code>, will be loaded from an
 * equally named subfolder of the <b>application root folder</b>.
 * If the resource name consists of multiple segments (separated by a dot), each segment
 * is assumed to represent an individual folder. In other words: when a resource name is
 * converted to an URL, any dots ('.') are converted to slashes ('/').
 *
 * <b>Limitation:</b> For the time being, the <b>application root folder</b> is assumed to be
 * the same as the folder where the current page resides in.
 * 
 * Usage sample:
 * <pre>
 *   // Let UI5 know that resources, whose name starts with "com.mycompany.myapp"
 *   // should be loaded from the URL location "./com/mycompany/myapp"
 *   sap.ui.localResources("com.mycompany.myapp");
 *
 *   // The following call implicitly will use the mapping done by the previous line
 *   // It will load a view from ./com/mycompany/myapp/views/Main.view.xml
 *   sap.ui.view({ view : "com.mycompany.myapp.views.Main", type : sap.ui.core.mvc.ViewType.XML});
 * </pre>
 *
 * When applications need a more flexible mapping between resource names and their location,
 * they can use {@link jQuery.sap.registerModulePath}.
 * 
 * It is intended to make this configuration obsolete in future releases, but for the time
 * being, applications must call this method when they want to store resources relative to
 * the assumed application root folder.
 * 
 * @param {String} sNamespace Namespace prefix for which to load resources relative to the application root folder
 * @public
 * @static
 * @see jQuery.sap.registerModulePath
 */
sap.ui.localResources = function(sNamespace) {
	jQuery.sap.assert(sNamespace, "sNamespace must not be empty");
	jQuery.sap.registerModulePath(sNamespace, "./" + sNamespace.replace(/\./g, "/"));
};
