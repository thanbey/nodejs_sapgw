/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.base.DataType
jQuery.sap.declare("sap.ui.base.DataType");

/**
 * @class Describes the metadata of a data type and provides methods for validation.
 * @author Frank Weigel
 * @since 0.9.0
 */
sap.ui.base.DataType = function() {
	// Avoid construction of a DataType.
	// DataType is only a function to support the "instanceof" operator.
	throw new Error();
};

/**
 * The qualified name of the data type.
 * Note that this name usually equals the design time name of the type.
 * Only for primitive types it differs, namely it omits the package 'sap.ui.core'.
 * @return {string} name of the data type
 * @public
 */
sap.ui.base.DataType.prototype.getName = function() {
	return undefined;
};

/**
 * The base type of this type or undefined if this is a primitive type.
 * @return {sap.ui.base.DataType} base type or undefined
 * @public
 */
sap.ui.base.DataType.prototype.getBaseType = function() {
	return undefined;
};

/**
 * The component type of this type or undefined if this is not an array.
 * @return {sap.ui.base.DataType} component type or undefined
 * @public
 */
sap.ui.base.DataType.prototype.getComponentType = function() {
	return undefined;
};

/**
 * The default value for this type. Each type must define a default value.
 * @return {any} default value of the data type. The type of the returned value
 *    must match the JavaScript type of the data type (a string for string types etc.)
 * @public
 */
sap.ui.base.DataType.prototype.getDefaultValue = function() {
	return undefined;
};

/**
 * Parses the given string value and converts it into the specific data type.
 * @param {string} sValue string representation for a value of this type
 * @return the value in the correct internal format
 * @public
 */
sap.ui.base.DataType.prototype.parseValue = function(sValue) {
	// currently this function considers to handle primitive values
	// - in future may be other values might be also relevant.
	var sType = this.getName();
	if (sType == "string") {
		return sValue;
	} else if (sType == "boolean") {
		return sValue == "true";
	} else if (sType == "int") {
		return parseInt(sValue, 10);
	} else if (sType == "float") {
		return parseFloat(sValue);
	} else {
		// support for other types like e.g.
		// sap.ui.core.CSSSize (just apply)
		return sValue;
	}
};

/**
 * A validation check. To be implemented by concrete types.
 * @param {any} vValue the value to be checked
 * @return {boolean} whether the given value is valid for this data type (without conversion)
 * @public
 */
sap.ui.base.DataType.prototype.isValid = undefined;

(function() {

	function createType(name, s, base) {

		jQuery.sap.assert(typeof name === "string" && !!name, "DataType.<createType>: type name must be a string");
		jQuery.sap.assert(!base || base instanceof sap.ui.base.DataType, "DataType.<createType>: base type must be empty or a DataType");
		s = s || {};
		base = base || sap.ui.base.DataType.prototype;

		// create a new type object with the base type as prototype
		var type = jQuery.sap.newObject(base);

		// getter for the name
		type.getName = function() { return name; };

		// if a default value is specified, create a getter for it
		if ( s.hasOwnProperty("defaultValue") ) {
			var vDefault = s.defaultValue;
			type.getDefaultValue = function() { return vDefault; };
		}

		// if a validator is specified either chain it with the base type validator
		// or set it if no base validator exists
		if ( s.hasOwnProperty("isValid") ) {
			var fnIsValid = s.isValid;
			type.isValid = base.isValid ? function(vValue) {
				if ( !base.isValid(vValue) ) {
					return false;
				}
				return fnIsValid(vValue);
			} : fnIsValid;
		};

		return type;
	}
	
	function createArrayType(componentType) {
		jQuery.sap.assert(componentType instanceof sap.ui.base.DataType, "DataType.<createArrayType>: compoinentType must be a DataType");

		// create a new type object with the base type as prototype
		var type = jQuery.sap.newObject(sap.ui.base.DataType.prototype);

		// getter for the name
		type.getName = function() { return componentType.getName() + "[]"; };

		// getter for component type
		type.getComponentType = function() { return componentType; };
		
		// array validator
		type.isValid = function(aValues) {
			if (aValues === null) {
				return true;
			}
			if (jQuery.isArray(aValues)) {
				for (var i = 0; i < aValues.length; i++) {
					if (!componentType.isValid(aValues[i])) {
						return false;
					}
				}
				return true;
			}
			return false;
		};
		
		// array parser
		type.parseValue = function(sValue) {
			var aValues = sValue.split(",");
			for (var i = 0; i < aValues.length; i++) {
				aValues[i] = componentType.parseValue(aValues[i]);
			}
			return aValues;
		};

		return type;
	}

	var PREDEFINED_TYPES = {

		"boolean" :
			createType("boolean", {
				defaultValue : false,
				isValid : function(vValue) {
					return typeof vValue === "boolean";
				}
			}),

		"int" :
			createType("int", {
				defaultValue : 0,
				isValid : function(vValue) {
					return typeof vValue === "number" && Math.floor(vValue) == vValue;
				}
			}),

		"float" :
			createType("float", {
				defaultValue : 0.0,
				isValid : function(vValue) {
					return typeof vValue === "number";
				}
			}),

		"string" :
			createType("string", {
				defaultValue : "",
				isValid : function(vValue) {
					return typeof vValue === "string";
				}
			}),
		"object" :
			createType("object", {
				defaultValue : null,
				isValid : function(vValue) {
					return typeof vValue === "object" || typeof vValue === "function";
				}
			})
	};

	/**
	 * Returns the type object for the type with the given name.
	 * @return the type object or undefined when no such type object exists.
	 * @public
	 */
	sap.ui.base.DataType.getType = function(sTypeName) {
		if (sTypeName.indexOf("[]") > 0) {
			var sComponentTypeName = sTypeName.substr(0, sTypeName.length - 2),
				oComponentType = this.getType(sComponentTypeName);
			return oComponentType && createArrayType(oComponentType);
		} else {
			return PREDEFINED_TYPES[sTypeName] || jQuery.sap.getObject(sTypeName);
		}
	};

	/**
	 * Creates a new type as a subtype of a given type.
	 * @param {string} sName the unique name of the new type
	 * @param {object} [mSettings settings] for the new type
	 * @param {any} [mSettings.defaultValue] the default value for the new type
	 * @param {function} [mSettings.isValid] a validator function for values of the new type
	 * @param {sap.ui.base.DataType} [base] the base type for the new type
	 * @public
	 */
	sap.ui.base.DataType.createType = createType;

}());