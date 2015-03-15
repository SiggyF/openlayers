/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */
 
/**
 * @requires OpenLayers/Format/XML.js
 * @requires OpenLayers/Format/WPSExecuteResponse.js
 * @requires OpenLayers/Format/OWSCommon/v1_1_0.js
 */

/**
 * Class: OpenLayers.Format.WPSExecuteResponse.v1_0_0
 * Read WPS ExecuteResponse 1.0.0 responses. 
 *
 * Inherits from:
 *  - <OpenLayers.Format.XML>
 */
OpenLayers.Format.WPSExecuteResponse.v1_0_0 = OpenLayers.Class(
    OpenLayers.Format.XML, {
    
    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        wps: "http://www.opengis.net/wps/1.0.0",
        ows: "http://www.opengis.net/ows/1.1",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
        gml: "http://www.opengis.net/gml",
        wfs: "http://www.opengis.net/wfs",
        ogc: "http://www.opengis.net/ogc",
        wcs: "http://www.opengis.net/wcs",
        xlink: "http://www.w3.org/1999/xlink"
    },

    /**
     * APIProperty: errorProperty
     * {String} Which property of the returned object to check for in order to
     * determine whether or not parsing has failed. In the case that the
     * errorProperty is undefined on the returned object, the document will be
     * run through an OGCExceptionReport parser.
     */
    errorProperty: "executeResponse",

    /**
     * Property: schemaLocation
     * {String} Schema location
     */
    schemaLocation: "http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd",

    /**
     * Property: defaultPrefix
     */
    defaultPrefix: "wps",

    /**
     * Property: regExes
     * Compiled regular expressions for manipulating strings.
     */
    regExes: {
        trimSpace: (/^\s*|\s*$/g),
        removeSpace: (/\s*/g),
        splitSpace: (/\s+/),
        trimComma: (/\s*,\s*/g)
    },
    
    /**
     * Constructor: OpenLayers.Format.WPSExecuteResponse
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
    read: function(data) {
        if(typeof data == "string") {
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        if(data && data.nodeType == 9) {
            data = data.documentElement;
        }
        var info = {};
        this.readNode(data, info);
        return info;
    },

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: {
        "wps": {
            "ExecuteResponse": function(node, obj) {
                obj.executeResponse = {
                    lang: node.getAttribute("lang"),
                    statusLocation: node.getAttribute("statusLocation"),
                    serviceInstance: node.getAttribute("serviceInstance"),
                    service: node.getAttribute("service")
                };
                this.readChildNodes(node, obj.executeResponse);
            },
            "Process":function(node,obj) {
                obj.process = {};
                this.readChildNodes(node, obj.process);
            },
            "Status":function(node,obj) {
                obj.status = {
                    creationTime: node.getAttribute("creationTime")
                };
                this.readChildNodes(node, obj.status);
            },
            "ProcessOutputs": function(node, processDescription) {
                processDescription.processOutputs = [];
                this.readChildNodes(node, processDescription.processOutputs);
            },
            "Output": function(node, processOutputs) {
                var output = {};
                this.readChildNodes(node, output);
                processOutputs.push(output);
            },
            "Reference": function(node, output) {
                output.reference = {
                    href: node.getAttribute("href"),
                    mimeType: node.getAttribute("mimeType"),
                    encoding: node.getAttribute("encoding"),
                    schema: node.getAttribute("schema")
                };
            },
            "Data": function(node, output) {
                output.data = {};
                this.readChildNodes(node, output);
            },
            "LiteralData": function(node, output) {
                output.literalData = {
                    dataType: node.getAttribute("dataType"),
                    uom: node.getAttribute("uom"),
                    value: this.getChildValue(node)
                };
            },
            "ComplexData": function(node, output) {
                output.complexData = {
                    mimeType: node.getAttribute("mimeType"),
                    schema: node.getAttribute("schema"),
                    encoding: node.getAttribute("encoding"),
                    value: ""
                };
                
                // try to get *some* value, ignore the empty text values
                if (this.isSimpleContent(node)) {
                    var child;
                    for(child=node.firstChild; child; child=child.nextSibling) {
                        switch(child.nodeType) {
                            case 3: // text node
                            case 4: // cdata section
                                output.complexData.value += child.nodeValue;
                        }
                    }
                }
                else {
                    for(child=node.firstChild; child; child=child.nextSibling) {
                        if (child.nodeType == 1) {
                            output.complexData.value = child;
                        }
                    }
                }

            },
            "BoundingBox": function(node, output) {
                output.boundingBoxData = {
                    dimensions: node.getAttribute("dimensions"),
                    crs: node.getAttribute("crs")
                };
                this.readChildNodes(node, output.boundingBoxData);
            },
            "ProcessDescription": function(node, processDescriptions) {
                var processVersion = this.getAttributeNS(node, this.namespaces.wps, "processVersion");
                var processDescription = {
                    processVersion: processVersion,
                    statusSupported: (node.getAttribute("statusSupported") === "true"),
                    storeSupported: (node.getAttribute("storeSupported") === "true")
                };
                this.readChildNodes(node, processDescription);
                processDescriptions[processDescription.identifier] = processDescription;
            },
            "DataInputs": function(node, processDescription) {
                processDescription.dataInputs = [];
                this.readChildNodes(node, processDescription.dataInputs);
            },
            "ComplexOutput": function(node, output) {
                output.complexOutput = {};
                this.readChildNodes(node, output.complexOutput);
            },
            "LiteralOutput": function(node, output) {
                output.literalOutput = {};
                this.readChildNodes(node, output.literalOutput);
            },
            "Input": function(node, dataInputs) {
                var input = {
                    maxOccurs: parseInt(node.getAttribute("maxOccurs")),
                    minOccurs: parseInt(node.getAttribute("minOccurs"))
                };
                this.readChildNodes(node, input);
                dataInputs.push(input);
            },
            "BoundingBoxData": function(node, input) {
                input.boundingBoxData = {};
                this.readChildNodes(node, input.boundingBoxData);
            },
            "CRS": function(node, obj) {
                if (!obj.CRSs) {
                    obj.CRSs = {};
                }
                obj.CRSs[this.getChildValue(node)] = true;
            },
            "DefaultValue": function(node, literalData) {
                literalData["defaultValue"] = this.getChildValue(node);
            },
            "Default": function(node, complexData) {
                complexData["default"] = {};
                this.readChildNodes(node,  complexData["default"]);
            },
            "Supported": function(node, complexData) {
                complexData["supported"] = {};
                this.readChildNodes(node,  complexData["supported"]);
            },
            "Format": function(node, obj) {
                var format = {};
                this.readChildNodes(node, format);
                if (!obj.formats) {
                    obj.formats = {};
                }
                obj.formats[format.mimeType] = true;
            },
            "MimeType": function(node, format) {
                format.mimeType = this.getChildValue(node);
            },
            "ProcessAccepted": function(node, status) {
                status.processSucceeded = true;
                status["status"] = "accepted";
                this.readChildNodes(node, status);
            },
            "ProcessStarted": function(node, status) {
                status["status"] = "started";
                this.readChildNodes(node, status);
            },
            "ProcessPaused": function(node, status) {
                status["status"] = "paused";
                this.readChildNodes(node, status);
            },
            "ProcessSucceeded": function(node, status) {
                status["status"] = "succeeded";
                this.readChildNodes(node, status);
            },
            "ProcessFailed": function(node, status) {
                status["status"] = "failed";
                this.readChildNodes(node, status);
            },
            "ExceptionReport": function(node, status) {
                status.exceptionReport = {
                    exceptions: []
                };
                this.readChildNodes(node, status.exceptionReport);
            }
        },
        "ows": OpenLayers.Format.OWSCommon.v1_1_0.prototype.readers["ows"]
    },
    
    CLASS_NAME: "OpenLayers.Format.WPSExecuteResponse" 

});
