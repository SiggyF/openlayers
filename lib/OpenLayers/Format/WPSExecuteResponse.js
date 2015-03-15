/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/XML/VersionedOGC.js
 */

/**
 * Class: OpenLayers.Format.WPSExecuteResponse
 * Read WPS ExecuteResponse responses.
 *
 * Inherits from:
 *  - <OpenLayers.Format.VersionedOGC>
 */
OpenLayers.Format.WPSExecuteResponse = OpenLayers.Class(
    OpenLayers.Format.XML.VersionedOGC, {


    /**
     * APIProperty: defaultVersion
     * {String} Version number to assume if none found.  Default is "1.0.0".
     */
    defaultVersion: "1.0.0",

    /**
     * Constructor: OpenLayers.Format.WPSExecuteResponse
     * Create a new parser for WPS ExecuteResponse.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */

    /**
     * APIMethod: read
     * Parse a WPS ExecuteResponse and return an object with its information.
     *
     * Parameters:
     * data - {String} or {DOMElement} data to read/parse.
     *
     * Returns:
     * {Object}
     */

    CLASS_NAME: "OpenLayers.Format.WPSExecuteResponse"

});
