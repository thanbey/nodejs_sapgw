/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the real core class sap.ui.core.Core of SAPUI5
jQuery.sap.declare("sap.ui.core.Core");

jQuery.sap.require("jquery.sap.dom");
jQuery.sap.require("jquery.sap.events");
jQuery.sap.require("jquery.sap.properties");
jQuery.sap.require("jquery.sap.resources");
jQuery.sap.require("jquery.sap.script");
jQuery.sap.require("sap.ui.Global");
jQuery.sap.require("sap.ui.base.EventProvider");
jQuery.sap.require("sap.ui.core.Configuration");
jQuery.sap.require("sap.ui.core.Control");
jQuery.sap.require("sap.ui.core.FocusHandler");
jQuery.sap.require("sap.ui.core.ResizeHandler");
jQuery.sap.require("sap.ui.core.RenderManager");
jQuery.sap.require("sap.ui.core.UIArea");

/**
 * @class Core Class of the SAP UI Library.
 *
 * This class boots the Core framework and makes it available for the Application
 * via the method <code>sap.ui.getCore()</code>.
 *
 * Example:<br/>
 * <pre>   var oCore = sap.ui.getCore();</pre><br/>
 *
 * It provides events where the Application can attach to.<br/>
 * Example:<br/>
 * <pre>
 * oCore.attachInitEvent(function () {
 *   //do the needful, do it lean
 * });
 * </pre><br/>
 *
 * It registers the Browser Eventing.
 *
 * @extends sap.ui.base.EventProvider
 * @final
 * @author Martin Schaus, Daniel Brinkmann
 * @version 1.2.0
 * @constructor
 * @public
 */
sap.ui.core.Core = function() {

	//make this class only available once
	if(sap.ui.getCore && sap.ui.getCore()) {
		return sap.ui.getCore();
	}

	var that=this,
		log = jQuery.sap.log,
		METHOD="sap.ui.core.Core";
	
	//inheritance to be able to fire internal events
	sap.ui.base.EventProvider.apply(this);

	/**
	 * Whether the core has been booted
	 * @private
	 */
	this.bBooted = false;

	/**
	 * Whether the core has been initialized
	 * @private
	 */
	this.bInitialized = false;

	/**
	 * Available plugins in the order of registration.
	 * @private
	 */
	this.aPlugins = [];

	/**
	 * Collection of loaded libraries, keyed by their name.
	 * @private
	 */
	this.mLibraries = {};

	/**
	 * Already loaded resource bundles keyed by library and locale.
	 * @private
	 * @see sap.ui.core.Core.getLibraryResourceBundle
	 */
	this.mResourceBundles = {};

	/**
	 * Currently created UIAreas keyed by their id.
	 * @private
	 * FIXME how can a UI area ever be removed?
	 */
	this.mUIAreas = {};

	/**
	 * Default model used for databinding
	 * @private
	 */
	this.oModels = {};

	/**
	 * Map of of created Elements keyed by their id.
	 *
	 * Each element registers itself in its constructor and deregisters itself in its
	 * destroy method.
	 *
	 * @private
	 * TODO get rid of this collection as it represents a candidate for memory leaks
	 */
	this.mElements = {};

	/**
	 * Ordered collection of initEvent listeners
	 * Moved here (before boot()) so that the libraries can be registered for lazy load!!
	 * @private
	 */
	this.aInitListeners = [];

	/**
	 * Whether the legacy library has to be loaded.
	 * @private
	 */
	this.bInitLegacyLib = false;

	log.info("Creating Core",null,METHOD);

	/**
	 * Object holding the interpreted configuration
	 * Initialized from the global "sap-ui-config" object and from Url parameters
	 * @private
	 */
	this.oConfiguration = new sap.ui.core.Configuration();

	// grant Element "friend" access to Core for (de-)registration
	sap.ui.core.Element.prototype.register = function() {
		that.registerElement(this);
	};
	sap.ui.core.Element.prototype.deregister = function() {
		that.deregisterElement(this);
	};

	// handle modules
	var aModules = this.oConfiguration.modules;
	if ( this.oConfiguration.getDebug() ) {
		// add debug module if configured
		aModules.unshift("sap-ui-debug");
	}
	// enforce the core library as the first loaded module
	aModules.unshift("sap.ui.core.library");
	log.info("Declared modules: " + aModules, METHOD);

	// set CSS class for the theme name
	this.sTheme = this.oConfiguration.getTheme();
	jQuery(document.documentElement).addClass("sapUiTheme-" + this.sTheme);
	log.info("Declared theme " + this.sTheme,null,METHOD);

	if (this.oConfiguration.getRTL()) {
		jQuery(document.documentElement).attr("dir", "rtl"); // webkit does not allow setting document.dir before the body exists
		log.info("RTL mode activated",null,METHOD);
	}

	sap.ui.global.resourceRoot = jQuery.sap.getModulePath('', '/');
	sap.ui.global.jsRoot=sap.ui.global.resourceRoot + "js";
	sap.ui.global.themeRoot=sap.ui.global.resourceRoot + "themes";
	if ( this.oConfiguration.getDebug() ) {
		sap.ui.global.debugFolder = "dbg";
	}

	log.info("sap.ui.global.resourceRoot: " + sap.ui.global.resourceRoot,null,METHOD);
	log.info("sap.ui.global.themeRoot: " + sap.ui.global.themeRoot,null,METHOD);
	log.info("sap.ui.global.jsRoot: " + sap.ui.global.jsRoot,null,METHOD);

	function calcBrowserId() {

		var b = jQuery.browser,
			ua = navigator.userAgent,
			browserVersion = parseFloat(b.version);

		// jQuery checks for user agent strings. We differentiate between browsers
		if ( b.mozilla ) {
			if ( ua.match(/Firefox\/(\d+\.\d+)/) ) {
				browserVersion = parseFloat(RegExp.$1);
				b.fVersion = browserVersion;
				if ( browserVersion >= 4 ) {
					return "ff4";
				}
				if ( browserVersion >= 3 ) {
					return "ff3";
				}
			}
		} else if ( b.webkit ) {
			if ( ua.match(/Chrome\/(\d+\.\d+).\d+/) ) {
				b.chrome = true;
				b.safari = false;
				browserVersion = parseFloat(RegExp.$1);
				b.fVersion = browserVersion;
				return "cr" + browserVersion;
			} else { // I do not know why but Safari might have an issue with ua.match(...); thus changing
				var oExp = /Version\/(\d+\.\d+).\d* *Safari/;
				if(oExp.test(ua)) {
					b.safari = true;
					browserVersion = parseFloat(oExp.exec(ua)[1]);
					b.fVersion = browserVersion;
					if ( browserVersion >= 5 ) {
						return "sf5";
					}
					if ( browserVersion >= 4 ) {
						return "sf4";
					}
				}
			}
		} else if ( b.msie ) {
			// recognize IE8 when running in compat mode (only then the documentMode property is there)
			if (document.documentMode) {
				if(document.documentMode === 7) {
					// OK, obviously we are IE and seem to be 7... but as documentMode is there this cannot be IE7!
					log.warning("Browser running in IE7 document mode.", null, METHOD);
					b.fVersion = 8.0;
					return "ie8"; // how do we solve this in higher versions? Where do we get this information from?
				}
				b.fVersion = parseFloat(document.documentMode);
				return "ie" + document.documentMode;
			} else {
				b.fVersion = browserVersion;
				return "ie" + browserVersion;
			}
		}
		
		// otherwise not recognized...
	}

	//set the browser for css attribute selectors. do not move this to the onload function because sf and ie do not
	//use the classes
	var id = calcBrowserId();
	if ( id ) {
		jQuery("html").attr("data-sap-ui-browser", id);
		log.debug("Browser-Id: " + id, null, METHOD);
	}
	
	//if weinre id is set, load weinre target script
	if (this.oConfiguration.getWeinreId()) {
		log.info("Starting WEINRE Remote Web Inspector");
		document.write("<script src=\"");
		document.write(this.oConfiguration.getWeinreServer() + "/target/target-script-min.js#" + this.oConfiguration.getWeinreId());
		document.write("\"></script>");
	}

	// create accessor to the Core API early so that initLibrary and others can use it
	/**
	 * Retrieve the {@link sap.ui.core.Core SAPUI5 Core} instance for the current window.
	 * @returns the API of the current SAPUI5 Core instance.
	 * @public
	 * @function
	 */
	sap.ui.getCore = jQuery.sap.getter(this.getInterface());

	if (!this.oConfiguration['xx-loadAllMode'] && !this.oConfiguration['xx-preload'] && (!window.document.body || window.document.readyState)) {
		//the instance will boot now
		this.boot();
	}

	//Init the HTML5 support if necessary before initialize the RenderManager
	sap.ui.core.RenderManager.initHTML5Support();
	// create the RenderManager so it can be used already
	this.oRenderManager = new sap.ui.core.RenderManager();

	//register to load event of the browser
	jQuery(document).ready(jQuery.proxy(this, "handleLoad")); // make sure SAPUI5 is first when jQuery.ready is fired
	
	if ( this.oConfiguration['xx-preload'] ) {
		jQuery.each(aModules, function(i,mod) {
			var m = mod.match(/^(.*)\.library$/);
			if ( m ) {
				var sPreloadModule = m[1].replace(/\./g, "-") + "-preload";
				jQuery.sap.log.debug("preload file " + sPreloadModule);
				jQuery.ajax({
					dataType : "text",
					async : that.oConfiguration['xx-preload'] !== "sync",
					url : jQuery.sap.getModulePath(sPreloadModule, ".js"),
					success : function(data) {
						jQuery.sap.globalEval(data);
					}
				});
			}
		});
	}

};

sap.ui.core.Core.prototype = jQuery.sap.newObject(sap.ui.base.EventProvider.prototype);
sap.ui.base.Object.defineClass("sap.ui.core.Core", {
		// ---- object ----
		baseType : "sap.ui.base.EventProvider",
		publicMethods : ["boot", "isInitialized","attachInitEvent","getRenderManager","createRenderManager",
						 "getConfiguration", "setRoot", "createUIArea", "getUIArea", "getUIDirty", "getElementById",
						 "getCurrentFocusedControlId", "getControl","lock", "unlock","isLocked",
						 "attachEvent","detachEvent","addProcessedEvent","removeProcessedEvent","applyChanges",
						 "applyTheme","attachThemeChanged","detachThemeChanged","getStaticAreaRef",
						 "registerPlugin","unregisterPlugin","getLibraryResourceBundle", "byId",
						 "getLoadedLibraries", "attachControlEvent", "detachControlEvent", "loadLibrary", "initLibrary",
						 "includeLibraryTheme", "setModel", "getModel", "hasModel", "isMobile", "attachParseError", "detachParseError", 
						 "attachValidationError", "detachValidationError", "attachFormatError", "detachFormatError", "attachValidationSuccess",
						 "detachValidationSuccess", "fireFormatError", "fireParseError", "fireValidationError", "fireValidationSuccess"]
	});
/**
 * Map of event names and ids, that are provided by this class
 * @private
 */
sap.ui.core.Core.M_EVENTS = {ControlEvent: "ControlEvent", UIUpdated: "UIUpdated", ThemeChanged: "ThemeChanged", 
		ValidationError : "validationError", ParseError : "parseError", FormatError : "formatError", ValidationSuccess : "validationSuccess"};

/**
 * Boots the core and injects the necessary css and js files for the library.
 * Applications shouldn't call this method. It is automatically called by the bootstrap scripts (e.g. sap-ui-core.js)
 * 
 * @private
 */
sap.ui.core.Core.prototype.boot = function() {

	if (this.bBooted) {
		return;
	}
	
	this.bBooted = true;
	
	//do not allow any event processing until the Core is booting
	this.lock();
	
	// load all modules now
	var that = this;
	jQuery.each(this.oConfiguration.modules, function(i,mod) {
		var m = mod.match(/^(.*)\.library$/);
		if ( m ) {
			that.loadLibrary(m[1]);
		} else {
			jQuery.sap.require(mod);
		}
	});
	
	//allow events again
	this.unlock();
};


/**
 * Applies the theme with the given name (by loading the respective style sheets, which does not disrupt the application)
 * @param {string} sThemeName the name of the theme to be loaded
 * @public
 */
sap.ui.core.Core.prototype.applyTheme = function(sThemeName) {
	jQuery.sap.assert(typeof sThemeName === "string", "sThemeName must be a string");
	
	// only apply the theme if it is a different one
	if (sThemeName && this.sTheme != sThemeName) {
		var sCurrentTheme = this.sTheme;
		// select "our" stylesheets
		jQuery("link[id^=sap-ui-theme-]").each(function() {
			// modify style sheet URL to point to the new theme
			//this.href = this.href.replace("/themes/"+sCurrentTheme+"/library","/themes/"+sThemeName+"/library");
			// be aware of custom css included with the colon (see includeLibraryTheme)
			this.href = this.href.replace("/themes/"+sCurrentTheme+"/","/themes/"+sThemeName+"/");
		});
		this.sTheme = sThemeName;
		this.getConfiguration().setTheme(sThemeName);

		// modify the <html> tag's CSS class with the theme name
		jQuery(document.documentElement).removeClass("sapUiTheme-" + sCurrentTheme).addClass("sapUiTheme-" + sThemeName);

		// notify the listeners
		jQuery.sap.delayedCall(250, this, "fireThemeChanged", [{theme: sThemeName}]); // TODO: only fire when we are sure the theme has been loaded. E.g. have a certain off-screen element with a width that can be derived from the theme name and is unique. And wait until the element has changed size.
	}
};


/**
 * Initializes the Core after the initial page was loaded
 * @private
 */
sap.ui.core.Core.prototype.init = function() {

	if (this.bInitialized) {
		return;
	}

	var log = jQuery.sap.log,
		METHOD = "sap.ui.core.Core.init()";

	// ensure that the core is booted now (e.g. loadAllMode)
	this.boot();
	
	log.info("Initializing",null,METHOD);

	this.oFocusHandler = new sap.ui.core.FocusHandler(document.body, this);
	this.oResizeHandler = new sap.ui.core.ResizeHandler(this);

	log.info("Initialized",null,METHOD);

	this.bInitialized = true;

	// start the plugins
	log.info("Starting Plugins",null,METHOD);
	this.startPlugins();
	log.info("Plugins started",null,METHOD);

	var oConfig = this.oConfiguration;
	// create any pre-configured UIAreas
//	if ( oConfig.areas && oConfig.areas.length > 0 ) {
	if ( oConfig.areas ) {
		// log.warning("deprecated config option '(data-sap-ui-)areas' used.");
		for (var i=0, l = oConfig.areas.length; i < l; i++) {
			this.createUIArea(oConfig.areas[i]);
		}
		oConfig.areas = undefined;
	}

	// execute a configured init hook
	if ( oConfig.onInit ) {
		if ( typeof oConfig.onInit === "function" ) {
			oConfig.onInit();
		} else {
			// DO NOT USE jQuery.globalEval as it executes async in FF!
			jQuery.sap.globalEval(oConfig.onInit);
		}
		oConfig.onInit = undefined;
	}

	// execute registered init event handlers
	if (this.aInitListeners.length > 0) {
		log.info("Fire Loaded Event",null,METHOD);
		jQuery.each(this.aInitListeners, function(i,f) { f(); }); // TODO is jQuery.each safe wrt. concurrent modifications?
		this.aInitListeners = [];
	}

	this._rerenderAllUIAreas(); // directly render without setTimeout, so rendering is guaranteed to be finished when init() ends
};

/**
 * Handles the load event of the browser to initialize the Core
 * @private
 */
sap.ui.core.Core.prototype.handleLoad = function () {

	//do not allow any event processing until the Core is initialized
	var bWasLocked = this.isLocked();
	if ( !bWasLocked ) {
		this.lock();
	}
	this.init();
	//allow event processing again
	if ( !bWasLocked ) {
		this.unlock();
	}

};

/**
 * Returns true if the core has already been initialized. This means that instances of RenderManager,
 * etc. do already exist and the init event has already been fired (and will not
 * be fired again).
 *
 * @return whether the core has already been initialized
 * @public
 */
sap.ui.core.Core.prototype.isInitialized = function () {
	return this.bInitialized;
};

/**
 * Attaches a given function to the initialized event of the core.
 * This event will only be fired once; you can check if it already has been fired by calling isInitialized().
 *
 * @param func the function to be called on event firing.
 * @public
 */
sap.ui.core.Core.prototype.attachInitEvent = function (func) {
	jQuery.sap.assert(typeof func === "function", "func must be a function");
	this.aInitListeners.push(func);
};

/**
 * Locks the Core. No browser events are dispatched to the controls.
 * Lock should be called before and after the dom is modified for rendering, roundtrips...
 * Exceptions might be the case for asynchronous UI behavior
 * @public
 */
sap.ui.core.Core.prototype.lock = function () {
	this.bLocked = true;
};

/**
 * Unlocks the Core. Browser events are dispatched to the controls after
 * this method is called.
 * @public
 */
sap.ui.core.Core.prototype.unlock = function () {
	this.bLocked = false;
};

/**
 * Returns the locked state of the <code>sap.ui.core.Core</code>
 * @type boolean
 * @return locked state
 * @public
 */
sap.ui.core.Core.prototype.isLocked = function () {
	return this.bLocked;
};

/**
 * Returns the Configuration instance of the current Core instance.
 *
 * @return {sap.ui.core.Configuration} the Configuration instance of the current Core instance.
 * @public
 */
sap.ui.core.Core.prototype.getConfiguration = function () {
	return this.oConfiguration;
};

/**
 * @public
 * @deprecated Since version 0.15.0. Replaced by <code>createRenderManager()</code>
 */
sap.ui.core.Core.prototype.getRenderManager = function() {
	return this.createRenderManager(); //this.oRenderManager;
};

/**
 * Returns a new instance of the RenderManager interface.
 *
 * @return {sap.ui.core.RenderManager} the new instance of the RenderManager interface.
 * @public
 */
sap.ui.core.Core.prototype.createRenderManager = function() {
	return (new sap.ui.core.RenderManager()).getInterface();
};

/**
 * Returns the Id of the control/element currently in focus.
 * @return {string} the Id of the control/element currently in focus.
 * @public
 */
sap.ui.core.Core.prototype.getCurrentFocusedControlId = function() {
	return this.oFocusHandler.getCurrentFocusedControlId();
};

/**
 * Synchronously loads the given library and makes it available to the application.
 *
 * Loads the *.library module, which contains all preload modules (enums, types, content of a shared.js
 * if it exists). The library module will call initLibrary with additional metadata for the library.
 *
 * As a result, consuming applications can instantiate any control or element from that library
 * without having to write import statements for the controls or for the enums.
 * 
 * When the optional parameter <code>sUrl</code> is given, then all request for resources of the
 * library will be redirected to the given Url. This is convenience for a call to
 * <pre>
 *   jQuery.sap.registerModulePath(sLibrary, sUrl);
 * </pre>
 *
 * When the given library has been loaded already, no further action will be taken.
 * Especially, a given Url will not be honored!
 * 
 * @param {string} sLibrary name of the library to import
 * @param {string} [sUrl] URL to load the library from
 * @public
 */
sap.ui.core.Core.prototype.loadLibrary = function(sLibrary, sUrl) {
	jQuery.sap.assert(typeof sLibrary === "string", "sLibrary must be a string");
	jQuery.sap.assert(sUrl === undefined || typeof sUrl === "string", "sUrl must be a string or empty");

	// load libraries only once
	if ( !this.mLibraries[sLibrary] ) {
	
		var sModule = sLibrary + ".library",
			sAllInOneModule;
	
		// if a sUrl is given, redirect access to it
		if ( sUrl ) {
			jQuery.sap.registerModulePath(sLibrary, sUrl);
		}
		
		// optimization: in all-in-one mode we are loading all modules of the lib in a single file
		if ( this.oConfiguration['xx-loadAllMode'] && !jQuery.sap.isDeclared(sModule) ) {
			sAllInOneModule = sLibrary.replace(/\./g, "-") + "-all";
			jQuery.sap.log.debug("load all-in-one file " + sAllInOneModule);
			jQuery.sap.require(sAllInOneModule);
		}
		
		// require the library module (which in turn will call initLibrary())
		jQuery.sap.require(sModule);
		
		// check for legacy code
		if ( !this.mLibraries[sLibrary] ) {
			jQuery.sap.log.warning("library " + sLibrary + " didn't initialize itself");
			this.initLibrary(sLibrary); // TODO redundant to generated initLibrary call....
		}

	}
	
	return this.mLibraries[sLibrary];
};

/**
 * Initializes a library for an already loaded library module.
 *
 * This method is intended to be called only from a library.js (e.g. generated code).
 * It includes the library specific stylesheet into the current page, and creates
 * lazy import stubs for all controls and elements in the library.
 *
 * As a result, consuming applications don't have to write import statements for the controls or for the enums.
 *
 * Synchronously loads any libraries that the given library depends on.
 *
 * @param {string|object} vLibInfo name of or info object for the library to import
 * @public
 */
sap.ui.core.Core.prototype.initLibrary = function(vLibInfo) {
	jQuery.sap.assert(typeof vLibInfo === "string" || typeof vLibInfo === "object", "vLibInfo must be a string or object");
	
	var bLegacyMode = typeof vLibInfo === "string",
		oLibInfo = bLegacyMode ? { name : vLibInfo } : vLibInfo,
		sLibName = oLibInfo.name,
		log = jQuery.sap.log,
		METHOD =  "sap.ui.core.Core.initLibrary()";

	if ( bLegacyMode ) {
		log.warning("[Deprecated] library " + sLibName + " uses old fashioned initLibrary() call (rebuild with newest generator)");
	}

	if ( !sLibName || this.mLibraries[sLibName] ) {
		return;
	}

	log.debug("Analyzing Library " + sLibName, null, METHOD);

	// Create lib info object. Also used as a marker that the library is loading/has been loaded
	this.mLibraries[sLibName] = oLibInfo = jQuery.extend({
	  dependencies : [],
	  types : [],
	  interfaces : [],
	  controls: [],
	  elements : []
	}, oLibInfo);

	// this code could be moved to a separate "legacy support" module
	function readLibInfoFromProperties() {

		// read library properties
		var oProperties = jQuery.sap.properties({url : sap.ui.resource(sLibName, "library.properties")});

		// version info
		oLibInfo.version = oProperties.getProperty(sLibName + "[version]");

		// dependencies
		var sDepInfo = oProperties.getProperty(sLibName + "[dependencies]");
		log.debug("Required Libraries: " + sDepInfo, null, METHOD);
		oLibInfo.dependencies = (sDepInfo && sDepInfo.split(/[,;| ]/)) || [];

		// collect types, controls and elements
		var aKeys = oProperties.getKeys(),
		  rPattern = /(.+)\.(type|interface|control|element)$/,
		  aMatch;
		for(var i=0; i<aKeys.length; i++) {
			var sEntityPath = oProperties.getProperty(aKeys[i]);
			if ( aMatch = sEntityPath.match(rPattern) ) {
				oLibInfo[aMatch[2]+"s"].push(aKeys[i]);
			}
		}
	}

	// (legacy) if only a string was given, read the library.properties instead
	if ( bLegacyMode ) {
		readLibInfoFromProperties();
	}

	// resolve dependencies
	for(var i=0; i<oLibInfo.dependencies.length; i++) {
		var sDepLib = oLibInfo.dependencies[i];
		log.debug("resolve Dependencies to " + sDepLib, null, METHOD);
		if ( !this.mLibraries[sDepLib] ) {
			log.warning("Dependency from " + sLibName + " to " + sDepLib + " has not been resolved by library itself", null, METHOD);
			this.loadLibrary(sDepLib);
		}
	}

	// create lazy imports for all controls and elements
	var aElements = oLibInfo.controls.concat(oLibInfo.elements);
	for(var i=0; i<aElements.length; i++) {
		sap.ui.lazyRequire(aElements[i]);
	}

	// include the library theme
	this.includeLibraryTheme(sLibName);

	// expose some legacy names
	oLibInfo.sName = oLibInfo.name;
	oLibInfo.aControls = oLibInfo.controls;

	// load and execute the library.js script
	if ( !jQuery.sap.isDeclared(sLibName + ".library") ) {
		// TODO redundant to generated require calls
		log.warning("Library Module " + sLibName + ".library" + " not loaded automatically", null, METHOD);
		jQuery.sap.require(sLibName + ".library");
	}

};

/**
 * Includes a library theme into the current page (if a variant is specified it
 * will include the variant library theme)
 * @param {string} sLibName the name of the UI library
 * @param {string} [sVariant] the variant to include (optional)
 * @public
 */
sap.ui.core.Core.prototype.includeLibraryTheme = function(sLibName, sVariant) {
	jQuery.sap.assert(typeof sLibName === "string", "sLibName must be a string");
	jQuery.sap.assert(sVariant === undefined || typeof sVariant === "string", "sVariant must be a string or undefined");
	
	/*
	 * by specifiying a library name containing a colon (":") you can specify
	 * the file name of the CSS file to include (ignoring RTL)
	 */

	// include the stylesheet for the library (except for "classic" and "legacy" lib)
	if ((sLibName != "sap.ui.legacy") && (sLibName != "sap.ui.classic")) {

		// no variant?
		if (!sVariant) {
			sVariant = "";
		}

		// determine RTL
		var sRtl = (this.oConfiguration.getRTL() ? "-RTL" : "");

		// create the library file name
		var sLibId, sLibFileName;
		if (sLibName && sLibName.indexOf(":") == -1) {
			sLibId = sLibName + sVariant;
			sLibFileName = "library" + sVariant + sRtl;
		} else {
			sLibId = sLibName + sVariant;
			sLibFileName = sLibName.substring(sLibName.indexOf(":") + 1) + sVariant;
			sLibName = sLibName.substring(0, sLibName.indexOf(":"));
		}

		// log and include
		jQuery.sap.log.info("Including " + sLibName + "/themes/" + this.sTheme + "/" + sLibFileName + ".css" + " -  sap.ui.core.Core.includeLibraryTheme()");
		jQuery.sap.includeStyleSheet(jQuery.sap.getModulePath(sLibName + ".themes." + this.sTheme, "/") + sLibFileName + ".css", "sap-ui-theme-" + sLibId);

	}

};

/**
 * Returns a map which contains the names of the loaded libraries as keys
 * and some additional information about each library as values.
 * 
 * Note that the details of the 'values' in the returned map are not yet specified!
 * Their structure might change in future versions without notice. So applications
 * can only rely on the set of keys as well as the pure existance of a value.
 * 
 * @return {map} map of library names / controls
 * @public
 */
sap.ui.core.Core.prototype.getLoadedLibraries = function() {
	return jQuery.extend({}, this.mLibraries); // TODO deep copy or real Library object?
};

/**
 * Implicitly creates a new <code>UIArea</code> (or reuses an exiting one) for the given DOM reference and
 * adds the given control reference to the UIAreas content (existing content will be removed).
 *
 * @param {String,DomRef} oDomRef a Dom Reference or Id String of the UIArea
 * @param {sap.ui.base.Interface | sap.ui.core.Control}
 *            oControl the Control that should be the added to the <code>UIArea</code>.
 * @public
 * @deprecated Use function <code>oControl.placeAt(oDomRef, "only")</code> of <code>sap.ui.core.Control</code> instead.
 */
sap.ui.core.Core.prototype.setRoot = function(oDomRef, oControl) {
	jQuery.sap.assert(typeof oDomRef === "string" || typeof oDomRef === "object", "oDomRef must be a string or object");
	jQuery.sap.assert(oControl instanceof sap.ui.base.Interface || oControl instanceof sap.ui.core.Control, "oControl must be a Control or Interface");
	
	if(oControl) {
		oControl.placeAt(oDomRef, "only");
	}
};

/**
 * Creates a new sap.ui.core.UIArea
 *
 * @param {String,DomRef} oDomRef a DOM reference or ID string of the UIArea
 * @return a new UIArea
 * @type sap.ui.core.UIArea
 *
 * @public
 * @deprecated Use <code>setRoot()</code> instead!
 */
sap.ui.core.Core.prototype.createUIArea = function(oDomRef) {
	jQuery.sap.assert(typeof oDomRef === "string" || typeof oDomRef === "object", "oDomRef must be a string or object");
	
	if (!oDomRef) {
		throw new Error("oDomRef must not be null");
	}

	// oDomRef might be (and actually IS in most cases!) a string (the ID of a DOM element)
	if (typeof(oDomRef) === "string") {
		var id = oDomRef;
		oDomRef = jQuery.sap.domById(oDomRef);
		if (!oDomRef) {
			throw new Error("DOM element with ID '" + id + "' not found in page, but application tries to insert content.");
		}
	}

	// if the domref does not have an ID or empty ID => generate one
	if (!oDomRef.id || oDomRef.id.length == 0) {
		oDomRef.id = jQuery.sap.uid();
	}

	// create a new or fetch an existing UIArea
	var sId = oDomRef.id;
	if (!this.mUIAreas[sId]) {
		this.mUIAreas[sId] = new sap.ui.core.UIArea(this, oDomRef);
	} else {
		// this should solve the issue of 'recreation' of a UIArea
		// e.g. via setRoot with a new domRef
		this.mUIAreas[sId].setRootNode(oDomRef);
	}
	return this.mUIAreas[sId];

};

/**
 * Returns a UIArea if the given ID/Element belongs to one
 * 
 * @public
 * @param {String,DomRef} o a DOM Reference or ID String of the UIArea
 * @return a UIArea with a given id or dom ref.
 * @type sap.ui.core.UIArea
 */
sap.ui.core.Core.prototype.getUIArea = function(o) {
	jQuery.sap.assert(typeof o === "string" || typeof o === "object", "o must be a string or object");
	
	var sId = "";
	if (typeof(o)=="string") {
		sId = o;
	}
	else {
		sId = o.id;
	}

	if (sId) {
		return this.mUIAreas[sId];
	}

	return null;
};

/**
 * Informs the core about an UIArea that just became invalid.
 *
 * The core might use this information to minimize the set of
 * re-rendered UIAreas. But for the time being it just registers
 * a timer to trigger a re-rendering after the current event
 * has been processed.
 *
 * @param oUIArea {sap.ui.core.UIArea} UIArea that just became invalid
 * @private
 */
sap.ui.core.Core.prototype.addInvalidatedUIArea = function(oUIArea) {
	this.rerenderAllUIAreas(); // TODO: document why immediately rerender all??
};

/**
 * Retrieves a resource bundle for the given library and locale.
 *
 * If only one argument is given, it is assumed to be the libraryName. The locale
 * then falls back to the current {@link sap.ui.core.Configuration.prototype.getLanguage session locale}.
 * If no argument is given, the library also falls back to a default: "sap.ui.core".
 *
 * @param {string} [sLibraryName=sap.ui.core] name of the library to retrieve the bundle for
 * @param {string} [sLocale] locale to retrieve the resource bundle for
 * @return {jQuery.sap.util.ResourceBundle} the best matching resource bundle for the given parameters or undefined
 * @public
 */
sap.ui.core.Core.prototype.getLibraryResourceBundle = function(sLibraryName, sLocale) {
	jQuery.sap.assert((sLibraryName === undefined && sLocale === undefined) || typeof sLibraryName === "string", "sLibraryName must be a string or there is no argument given at all");
	jQuery.sap.assert(sLocale === undefined || typeof sLocale === "string", "sLocale must be a string or omitted");
	
	// TODO move implementation together with similar stuff to a new class "UILibrary"?
	sLibraryName = sLibraryName || "sap.ui.core";
	sLocale = sLocale || this.getConfiguration().getLanguage();
	var sKey = sLibraryName + "/" + sLocale;
	if (!this.mResourceBundles[sKey]) {
		var sURL = sap.ui.resource(sLibraryName, 'messagebundle.properties');
		this.mResourceBundles[sKey] = jQuery.sap.resources({url : sURL, locale : sLocale});
	}
	return this.mResourceBundles[sKey];
};

sap.ui.core.Core.prototype.rerenderAllUIAreas = function() {
	if ( !this._sRerenderTimer ) {
		jQuery.sap.log.info("registering timer for delayed re-rendering");
		this._sRerenderTimer = jQuery.sap.delayedCall(0,this,"_rerenderAllUIAreas"); // decoupled for collecting several invalidations into one redraw
	}
};

sap.ui.core.Core.prototype._rerenderAllUIAreas = function() {
	// clear the timer so that the next call to re-render will create a new timer
	if (this._sRerenderTimer) {
		jQuery.sap.clearDelayedCall(this._sRerenderTimer); // explicitly stop the timer, as this call might be synchronous while still a timer is running
		this._sRerenderTimer = undefined;
	}

	var bUIUpdated = false;
	for (var sId in this.mUIAreas) {
		bUIUpdated = this.mUIAreas[sId].rerender() || bUIUpdated;
	}
	// TODO: Provide information on what actually was re-rendered...
	if(bUIUpdated) {
		this.fireUIUpdated();
	}
};


/**
 * Returns "true" if the UI is marked as dirty and will be cleaned/re-rendered after a certain small timeout.
 * 
 * @return {boolean} true if some UI part is marked as dirty and will be cleaned up/re-rendered
 * @public
 */
sap.ui.core.Core.prototype.getUIDirty = function() {
	return !!this._sRerenderTimer;
};

/**
 * @name sap.ui.core.Core.prototype.UIUpdated
 * @event
 * @param {string} a
 * @param {object} source
 * @private
 */

sap.ui.core.Core.prototype.attachUIUpdated = function(fFunction, oListener) {
	this.attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fFunction, oListener);
};

sap.ui.core.Core.prototype.detachUIUpdated = function(fFunction, oListener) {
	this.detachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fFunction, oListener);
};

sap.ui.core.Core.prototype.fireUIUpdated = function(mParameters) {
	this.fireEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, mParameters);
};

/**
 * @name sap.ui.core.Core.prototype.ThemeChanged
 * @event
 * @param {string} a
 * @param {object} source
 */

sap.ui.core.Core.prototype.attachThemeChanged = function(fFunction, oListener) {
	this.attachEvent(sap.ui.core.Core.M_EVENTS.ThemeChanged, fFunction, oListener);
};

sap.ui.core.Core.prototype.detachThemeChanged = function(fFunction, oListener) {
	this.detachEvent(sap.ui.core.Core.M_EVENTS.ThemeChanged, fFunction, oListener);
};

sap.ui.core.Core.prototype.fireThemeChanged = function(mParameters) {
	// notify all elements/controls via a pseudo browser event
	var sEventId = sap.ui.core.Core.M_EVENTS.ThemeChanged;
	var oEvent = jQuery.Event(sEventId);
	jQuery.each(this.mElements, function(sId, oElement) {
		oElement._handleEvent(oEvent);
	});
	// notify the listeners via a control event
	this.fireEvent(sEventId, mParameters);
};

/**
 * Enforces an immediate update of the visible UI (aka "rendering").
 *
 * In general, applications should avoid calling this method and
 * instead let the framework manage any necessary rendering.
 * @public
 */
sap.ui.core.Core.prototype.applyChanges = function() {
	this._rerenderAllUIAreas();
};

/**
 * Stores the event which is currently processed in order to avoid unnecessary rerendering.
 * @param {sap.ui.core.Element} oProvider the origin of the event
 * @param {string} sEventId the id of the fired processed event
 */
sap.ui.core.Core.prototype.addProcessedEvent = function(oProvider,sEventId) {
	if (!this.oProcessedEvent) {
		this.oProcessedEvent = {oProvider: oProvider, sEventId: sEventId};
	}
};

/**
 * Provides information to the core that a beforehand registered event's processing is finished.<br/>
 * When the given combination was the root event of the processing stack, rerendering is called.
 * @param {sap.ui.core.Element} oProvider the origin of the event
 * @param {string} sEventId the id of the fired processed event
 */
sap.ui.core.Core.prototype.removeProcessedEvent = function(oProvider,sEventId) {
	var oProcessedEvent = this.oProcessedEvent;
	if (oProcessedEvent &&
		oProcessedEvent.oProvider == oProvider &&
		oProcessedEvent.sEventId == sEventId) {
		this.oProcessedEvent = null;
		// this.rerenderAllUIAreas();
	};
};

/**
 * Registers the given element. Must be called once during construction.
 * @param {sap.ui.core.Element} oElement
 * @private
 */
sap.ui.core.Core.prototype.registerElement = function(oElement) {
	var oldElement = this.byId(oElement.getId());
	if ( oldElement && oldElement !== oElement ) {
		// duplicate ID detected => fail or at least log a warning
		if (this.oConfiguration.getNoDuplicateIds()) {
			jQuery.sap.log.error("adding element with duplicate id '" + oElement.getId() + "'");
			throw new Error("Error: adding element with duplicate id '" + oElement.getId() + "'");
		} else {
			jQuery.sap.log.warning("adding element with duplicate id '" + oElement.getId() + "'");
		}
	}

	this.mElements[oElement.getId()] = oElement;
};

/**
 * Deregisters the given element. Must be called once during destruction.
 * @param {sap.ui.core.Element} oElement
 * @private
 */
sap.ui.core.Core.prototype.deregisterElement = function(oElement) {
	delete this.mElements[oElement.getId()];
};

/**
 * Returns the registered element for the given id, if any.
 * @param {string} sId
 * @return {sap.ui.core.Element} the element for the given id
 * @public
 */
sap.ui.core.Core.prototype.byId = function(sId) {
	jQuery.sap.assert(sId == null || typeof sId === "string", "sId must be a string when defined"); 
	// allow null, as this occurs frequently and it is easier to check whether there is a control in the end than 
	// first checking whether there is an ID and then checking for a control
	
	/*
	// test alternative implementation
	function findById(sId, mUIAreas) {
		function _find(oControl) {
			if ( !oControl )
				return undefined;
			if ( oControl.getId() === sId ) {
				return oControl;
			}
			for (var n in oControl.mAggregations) {
				var a = oControl.mAggregations[n];
				if ( a instanceof Array ) {
					for (var i=0; i<a.length; i++) {
						var r = _find(a[i]);
						if ( r ) return r;
					}
				} else if ( a instanceof sap.ui.core.Element ) {
					var r = _find(a[i]);
					if ( r ) return r;
				}
			}
			return undefined;
		}

		//var t0=new Date().getTime();
		var r=undefined;
		for (var n in mUIAreas) {
			r=_find(mUIAreas[n].getRootControl()); //TODO: Adapt to mUIAreas[n].getContent
			if ( r ) break;
		}
		//var t1=new Date().getTime();
		//t=t+(t1-t0);
		return r;
	}

	if ( findById(sId, this.mUIAreas) !== this.mElements[sId] ) {
		jQuery.sap.log.error("failed to resolve " + sId + " (" + this.mElements[sId] + ")");
	}
	*/
	return sId == null ? undefined : this.mElements[sId];
};

/**
 * Returns the registered element for the given ID, if any.
 * @param {string} sId
 * @return {sap.ui.core.Element} the element for the given id
 * @deprecated use <code>sap.ui.core.Core.byId</code> instead!
 * @function
 * @public
 */
sap.ui.core.Core.prototype.getControl = sap.ui.core.Core.prototype.byId;

/**
 * Returns the registered element for the given ID, if any.
 * @param {string} sId
 * @return {sap.ui.core.Element} the element for the given id
 * @deprecated use <code>sap.ui.core.Core.byId</code> instead!
 * @function
 * @public
 */
sap.ui.core.Core.prototype.getElementById = sap.ui.core.Core.prototype.byId;

/**
 * Returns the static, hidden area reference belonging to this core instance.<br/> It can be used e.g. for hiding
 * elements like Popups, Shadow, Blocklayer etc.<br/> If it is not yet available, creates one HTML element and attaches
 * it to the body.
 *
 * @return {DOMNode} the static, hidden area reference belonging to this core instance.
 * @public
 */
sap.ui.core.Core.prototype.getStaticAreaRef = function() {
	var sStaticId = "sap-ui-static";
	var oStatic = jQuery.sap.domById(sStaticId);
	if(!oStatic){
		var leftRight = this.getConfiguration().getRTL() ? "right" : "left";
		oStatic = jQuery("<DIV/>",{id:sStaticId})
					.css("visibility", "hidden")
					.css("height", "0")
					.css("width", "0")
					.css("overflow", "hidden")
					.css("float", leftRight)
					.prependTo(document.body)[0];

		// TODO Check whether this is sufficient
		this.createUIArea(oStatic).bInitial = false;
	}
	return oStatic;
};

/**
 * Registers a listener for control events
 * @param {function} sFunction
 * @param {object} [oListener]
 * @public
 */
sap.ui.core.Core.prototype.attachControlEvent = function(fFunction, oListener) {
	this.attachEvent(sap.ui.core.UIArea.M_EVENTS.ControlEvent, fFunction, oListener);
};

/**
 * Unregisters a listener for control events
 * @param {function} sFunction
 * @param {object} [oListener]
 * @public
 */
sap.ui.core.Core.prototype.detachControlEvent = function(fFunction, oListener) {
	this.detachEvent(sap.ui.core.UIArea.M_EVENTS.ControlEvent, fFunction, oListener);
};

/**
 * Notifies the listeners that a event on a control occures
 * @param {map} mParameters { browserEvent: jQuery.EventObject }
 * @private
 */
sap.ui.core.Core.prototype.fireControlEvent = function(mParameters) {
	this.fireEvent(sap.ui.core.UIArea.M_EVENTS.ControlEvent, mParameters);
};

/**
 * Handles a control event and forwards it to the registered control event
 * listeners
 * @param {jQuery.EventObject} control event
 * @private
 */
sap.ui.core.Core.prototype._handleControlEvent = function(/**event*/oEvent, sUiAreaId) {
	// Create a copy of the event
	var oEventClone = jQuery.Event(oEvent.type);
	jQuery.extend(oEventClone, oEvent);
	oEventClone.originalEvent = undefined;

	this.fireControlEvent({"browserEvent": oEventClone, "uiArea": sUiAreaId});
};


/**
 * Registers a Plugin to the <code>sap.ui.core.Core</code>, which lifecycle
 * will be managed (start and stop).
 * <br/>
 * Plugin object need to implement two methods:
 * <ul>
 *   <li><code>startPlugin(oCore)</code>: will be invoked, when the Plugin
 *       should start (as parameter the reference to the Core will be provided</li>
 *   <li><code>stopPlugin()</code>: will be invoked, when the Plugin should stop</li>
 * </ul>
 *
 * @param {object} oPlugin reference to a Plugin object
 * @public
 */
sap.ui.core.Core.prototype.registerPlugin = function(oPlugin) {
	jQuery.sap.assert(typeof oPlugin === "object", "oPlugin must be an object");
	
	// check for a valid plugin
	if (!oPlugin) {
		return;
	}

	// check if the plugin is already registered
	// if yes, the exit this function
	for (var i = 0, l = this.aPlugins.length; i < l; i++) {
		if (this.aPlugins[i] === oPlugin) {
			return;
		}
	}

	// register the plugin (keep the plugin in the plugin array)
	this.aPlugins.push(oPlugin);

	// if the Core is initialized also start the plugin
	if (this.bInitialized && oPlugin && oPlugin.startPlugin) {
		oPlugin.startPlugin(this);
	}

};

/**
 * Unregisters a Plugin out of the <code>sap.ui.core.Core</code>
 *
 * @param {object} oPlugin reference to a Plugin object
 * @public
 */
sap.ui.core.Core.prototype.unregisterPlugin = function(oPlugin) {
	jQuery.sap.assert(typeof oPlugin === "object", "oPlugin must be an object");
	
	// check for a valid plugin
	if (!oPlugin) {
		return;
	}

	// check if the plugin is already registered
	var iPluginIndex = -1;
	for (var i = this.aPlugins.length; i--; i >= 0) {
		if (this.aPlugins[i] === oPlugin) {
			iPluginIndex = i;
			break;
		}
	}

	// plugin was not registered!
	if (iPluginIndex == -1) {
		return;
	}

	// stop the plugin
	if (this.bInitialized && oPlugin && oPlugin.stopPlugin) {
		oPlugin.stopPlugin(this);
	}

	// remove the plugin
	this.aPlugins.splice(iPluginIndex, 1);

};

/**
 * Internal method to start all registered plugins
 * @private
 */
sap.ui.core.Core.prototype.startPlugins = function() {
	for (var i = 0, l = this.aPlugins.length; i < l; i++) {
		var oPlugin = this.aPlugins[i];
		if (oPlugin && oPlugin.startPlugin) {
			oPlugin.startPlugin(this, /* onInit*/ true);
		}
	}
};

/**
 * Internal method to stop all registered plugins
 * @private
 */
sap.ui.core.Core.prototype.stopPlugins = function() {
	for (var i = 0, l = this.aPlugins.length; i < l; i++) {
		var oPlugin = this.aPlugins[i];
		if (oPlugin && oPlugin.stopPlugin) {
			oPlugin.stopPlugin(this);
		}
	}
};

/**
 * Set the model for databinding
 * @param {sap.ui.model.Model} oModel
 * @param {string} [sName]
 * @public
 */
sap.ui.core.Core.prototype.setModel = function(oModel, sName) {
	jQuery.sap.assert(typeof oModel === "object", "oModel must be an object");
	jQuery.sap.assert(sName === undefined || typeof sName === "string", "sName must be a string or omitted");
	
	this.oModels[sName] = oModel;
	
	// notify all UI areas to update their bindings
	jQuery.each(this.mUIAreas, function (i, oUIArea){
		oUIArea.updateBindings(sName);
	});
	
};

/**
 * Get the model for databinding
 * @param {string} [sName]
 * @return {sap.ui.model.Model} oModel
 * @public
 */
sap.ui.core.Core.prototype.getModel = function(sName) {
	jQuery.sap.assert(typeof sName === "string", "sName must be a string");
	return this.oModels[sName];
};

/**
 * Check if a Model is set to the core
 * @return {boolean} true or false
 * @public
 */
sap.ui.core.Core.prototype.hasModel = function() {
	if (!jQuery.isEmptyObject(this.oModels)) {
		return true;
	} else {
		return false;
	}
};

/**
 * Attach event-handler <code>fnFunction</code> to the 'validationError' event of <code>sap.ui.core.Core</code>.<br/>
 * 
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs. This function will be called on the
 *            oListener-instance (if present) or in a 'static way'.
 * @param {object}
 *            [oListener] Object on which to call the given function. If empty, this Model is used.
 *
 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Core.prototype.attachValidationError = function(fnFunction, oListener) {
	this.attachEvent(sap.ui.core.Core.M_EVENTS.ValidationError, fnFunction, oListener);
	return this;
};

/**
 * Detach event-handler <code>fnFunction</code> from the 'validationError' event of <code>sap.ui.core.Core</code>.<br/>
 *
 * The passed function and listener object must match the ones previously used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Object on which the given function had to be called.
 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Core.prototype.detachValidationError = function(fnFunction, oListener) {
	this.detachEvent(sap.ui.core.Core.M_EVENTS.ValidationError, fnFunction, oListener);
	return this;
};

/**
 * Attach event-handler <code>fnFunction</code> to the 'parseError' event of <code>sap.ui.core.Core</code>.<br/>
 *  
 * @param {function}
 *            fnFunction The function to call, when the event occurs. This function will be called on the
 *            oListener-instance (if present) or in a 'static way'.
 * @param {object}
 *            [oListener] Object on which to call the given function. If empty, this Model is used.
 *
 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Core.prototype.attachParseError = function(fnFunction, oListener) {
	this.attachEvent(sap.ui.core.Core.M_EVENTS.ParseError, fnFunction, oListener);
	return this;
};

/**
 * Detach event-handler <code>fnFunction</code> from the 'parseError' event of <code>sap.ui.core.Core</code>.<br/>
 *
 * The passed function and listener object must match the ones previously used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Object on which the given function had to be called.
 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Core.prototype.detachParseError = function(fnFunction, oListener) {
	this.detachEvent(sap.ui.core.Core.M_EVENTS.ParseError, fnFunction, oListener);
	return this;
};

/**
 * Attach event-handler <code>fnFunction</code> to the 'formatError' event of <code>sap.ui.core.Core</code>.<br/>
 * 
 * @param {function}
 *            fnFunction The function to call, when the event occurs. This function will be called on the
 *            oListener-instance (if present) or in a 'static way'.
 * @param {object}
 *            [oListener] Object on which to call the given function. If empty, this Model is used.
 *
 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Core.prototype.attachFormatError = function(fnFunction, oListener) {
	this.attachEvent(sap.ui.core.Core.M_EVENTS.FormatError, fnFunction, oListener);
	return this;
};

/**
 * Detach event-handler <code>fnFunction</code> from the 'formatError' event of <code>sap.ui.core.Core</code>.<br/>
 *
 * The passed function and listener object must match the ones previously used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Object on which the given function had to be called.
 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Core.prototype.detachFormatError = function(fnFunction, oListener) {
	this.detachEvent(sap.ui.core.Core.M_EVENTS.FormatError, fnFunction, oListener);
	return this;
};

/**
 * Attach event-handler <code>fnFunction</code> to the 'validationSuccess' event of <code>sap.ui.core.Core</code>.<br/>
 * 
 * @param {function}
 *            fnFunction The function to call, when the event occurs. This function will be called on the
 *            oListener-instance (if present) or in a 'static way'.
 * @param {object}
 *            [oListener] Object on which to call the given function. If empty, this Model is used.
 *
 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Core.prototype.attachValidationSuccess = function(fnFunction, oListener) {
	this.attachEvent(sap.ui.core.Core.M_EVENTS.ValidationSuccess, fnFunction, oListener);
	return this;
};

/**
 * Detach event-handler <code>fnFunction</code> from the 'validationSuccess' event of <code>sap.ui.core.Core</code>.<br/>
 *
 * The passed function and listener object must match the ones previously used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Object on which the given function had to be called.
 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Core.prototype.detachValidationSuccess = function(fnFunction, oListener) {
	this.detachEvent(sap.ui.core.Core.M_EVENTS.ValidationSuccess, fnFunction, oListener);
	return this;
};


/**
 * Fire event parseError to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'element' of type <code>sap.ui.core.Element</code> </li>
 * <li>'property' of type <code>string</code> </li>
 * <li>'type' of type <code>string</code> </li>
 * <li>'newValue' of type <code>object</code> </li>
 * <li>'oldValue' of type <code>object</code> </li>
 * <li>'exception' of type <code>object</code> </li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
 * @protected
 */
sap.ui.core.Core.prototype.fireParseError = function(mArguments) {
	this.fireEvent(sap.ui.core.Core.M_EVENTS.ParseError, mArguments);
	return this;
};

/**
 * The 'parseError' event is fired when input parsing fails.
 *
 * @name sap.ui.core.Core#parseError
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.ui.core.Element} oControlEvent.getParameters.element The Element where the parse error occurred
 * @param {string} oControlEvent.getParameters.property The property name of the element where the parse error occurred
 * @param {type} oControlEvent.getParameters.type The type of the property
 * @param {object} oControlEvent.getParameters.newValue The value of the property which was entered when the parse error occurred
 * @param {object} oControlEvent.getParameters.oldValue The value of the property which was present before a new value was entered (before the parse error) 
 * @param {object} oControlEvent.getParameters.exception The exception object which occurred and has more information about the parse error
 * @public
 */

/**
 * Fire event validationError to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'element' of type <code>sap.ui.core.Element</code> </li>
 * <li>'property' of type <code>string</code> </li>
 * <li>'type' of type <code>string</code> </li>
 * <li>'newValue' of type <code>object</code> </li>
 * <li>'oldValue' of type <code>object</code> </li>
 * <li>'exception' of type <code>object</code> </li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
 * @protected
 */
sap.ui.core.Core.prototype.fireValidationError = function(mArguments) {
	this.fireEvent(sap.ui.core.Core.M_EVENTS.ValidationError, mArguments);
	return this;
};

/**
 * The 'validationError' event is fired when validation of the input fails.
 *
 * @name sap.ui.core.Core#validationError
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.ui.core.Element} oControlEvent.getParameters.element The Element where the validation error occurred
 * @param {string} oControlEvent.getParameters.property The property name of the element where the validation error occurred
 * @param {type} oControlEvent.getParameters.type The type of the property
 * @param {object} oControlEvent.getParameters.newValue The value of the property which was entered when the validation error occurred
 * @param {object} oControlEvent.getParameters.oldValue The value of the property which was present before a new value was entered (before the validation error) 
 * @param {object} oControlEvent.getParameters.exception The exception object which occurred and has more information about the validation error
 * @public
 */

/**
 * Fire event formatError to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'element' of type <code>sap.ui.core.Element</code> </li>
 * <li>'property' of type <code>string</code> </li>
 * <li>'type' of type <code>string</code> </li>
 * <li>'newValue' of type <code>object</code> </li>
 * <li>'oldValue' of type <code>object</code> </li>
 * <li>'exception' of type <code>object</code> </li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
 * @protected
 */
sap.ui.core.Core.prototype.fireFormatError = function(mArguments) {
	this.fireEvent(sap.ui.core.Core.M_EVENTS.FormatError, mArguments);
	return this;
};

/**
 * The 'formatError' event is fired when a value formatting fails. This can happen when a value stored in the model cannot be formatted to be displayed in an element property.
 *
 * @name sap.ui.core.Core#formatError
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.ui.core.Element} oControlEvent.getParameters.element The Element where the format error occurred
 * @param {string} oControlEvent.getParameters.property The property name of the element where the format error occurred
 * @param {type} oControlEvent.getParameters.type The type of the property
 * @param {object} oControlEvent.getParameters.newValue The value of the property which was entered when the format error occurred
 * @param {object} oControlEvent.getParameters.oldValue The value of the property which was present before a new value was entered (before the format error) 
 * @param {object} oControlEvent.getParameters.exception The exception object which occurred and has more information about the format error
 * @public
 */

/**
 * Fire event validationSuccess to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'element' of type <code>sap.ui.core.Element</code> </li>
 * <li>'property' of type <code>string</code> </li>
 * <li>'type' of type <code>string</code> </li>
 * <li>'newValue' of type <code>object</code> </li>
 * <li>'oldValue' of type <code>object</code> </li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
 * @protected
 */
sap.ui.core.Core.prototype.fireValidationSuccess = function(mArguments) {
	this.fireEvent(sap.ui.core.Core.M_EVENTS.ValidationSuccess, mArguments);
	return this;
};

/**
 * The 'validationSuccess' event is fired when a value validation was successfully completed.
 *
 * @name sap.ui.core.Core#validationSuccess
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.ui.core.Element} oControlEvent.getParameters.element The Element where the successful validation occurred
 * @param {string} oControlEvent.getParameters.property The property name of the element where the successfull validation occurred
 * @param {type} oControlEvent.getParameters.type The type of the property
 * @param {object} oControlEvent.getParameters.newValue The value of the property which was entered when the validation occurred
 * @param {object} oControlEvent.getParameters.oldValue The value of the property which was present before a new value was entered (before the validation)
 * @public
 */

/**
 * Check if the script is running on mobile
 * @return {boolean} true or false
 * @public
 */
sap.ui.core.Core.prototype.isMobile = function() {
	return !!window.orientation;
};

/**
 * @name sap.ui.core.CorePlugin
 * @interface Contract for plugins that want to extend the core runtime
 */

/**
 * Called by the Core after it has been initialized.
 * If a plugin is added to the core after its initialization, then
 * this method is called during registration of the plugin.
 *
 * Implementing this method is optional for a plugin.
 *
 * @name sap.ui.core.CorePlugin.prototype.startPlugin
 * @param {sap.ui.core.Core} oCore reference to the core
 * @param {boolean} bOnInit whether the hook is called during Core.init() or later
 * @function
 */

/**
 * Called by the Core when it is shutdown or when a plugin is
 * deregistered from the core.
 *
 * Implementing this method is optional for a plugin.
 *
 * @name sap.ui.core.CorePlugin.prototype.stopPlugin
 * @param {sap.ui.core.Core} oCore reference to the core
 * @function
 */


// TODO come up with more sophisticated solution.
// e.g. check for script tag, check for config... if not (yet) there, delay creation by e.g. 500ms or so.
if(!window.sap.ui.getCore){
	/**
	 * Create Core instance and make it available.
	 */
	(function(){
		new sap.ui.core.Core();
	}());
}

/**
 * Displays the control tree with the given root inside the area of the given
 * DOM reference (or inside the DOM node with the given ID) or in the given Control.
 *
 * Example:
 * <pre>
 *   &lt;div id="SAPUI5UiArea">&lt;/div>
 *   &lt;script type="text/javascript">
 *     var oRoot = new sap.ui.commons.Label();
 *     oRoot.setText("Hello world!");
 *     sap.ui.setRoot("SAPUI5UiArea", oRoot);
 *   &lt;/script>
 * </pre>
 * <p>
 *
 * This is a shortcut for <code>sap.ui.getCore().setRoot()</code>.
 *
 * Internally, if a string is given that does not identify an UIArea or a control
 * then implicitly a new <code>UIArea</code> is created for the given DOM reference
 * and the given control is added.
 *
 * @param {string|DOMRef|sap.ui.core.Control} oDomRef a Dom Reference or Id String of the UIArea
 * @param {sap.ui.base.Interface | sap.ui.core.Control}
 *            oControl the Control that should be added to the <code>UIArea</code>.
 * @public
 * @deprecated Use function <code>placeAt</code> of <code>sap.ui.core.Control</code> instead.
 */
sap.ui.setRoot = function(oDomRef, oControl) {
	jQuery.sap.assert(typeof oDomRef === "string" || typeof oDomRef === "object", "oDomRef must be a string or object");
	jQuery.sap.assert(oControl instanceof sap.ui.base.Interface || oControl instanceof sap.ui.core.Control, "oControl must be a Control or Interface");
	
	sap.ui.getCore().setRoot(oDomRef, oControl);
};
