/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides a popup with technical informations about the running SAPUI5 core
jQuery.sap.declare("sap.ui.debug.TechnicalInfo");

jQuery.sap.require("jquery.sap.strings");
jQuery.sap.require("sap.ui.core.Core");
jQuery.sap.require("sap.ui.core.Popup");

(function() {

	var DBG_MODE_URL = "sap-ui-xx-debug-mode";
	
	sap.ui.debug.TechnicalInfo = {
	
		open : function(callback) {
	
			function serialize(o) {
				if (o && window.JSON) {
					return window.JSON.stringify(o);
				}
				if ( o === "" ) {
					return '""';
				}
				return "" + o + (o ? "???" : "");
			}
	
			function list(o,prefix) {
				prefix = prefix||'';
				if ( !prefix ) {
					html.push("<table border='0' cellspacing='0' cellpadding='0'>");
				}
				jQuery.each(o, function(i,v) {
					if ( !v || typeof v === 'string' || typeof v === 'number' || v instanceof Date ) {
					  html.push("<tr><td>", prefix, "<b>", jQuery.sap.escapeHTML(serialize(i)), "</b></td><td>", jQuery.sap.escapeHTML(serialize(v)), "</td></tr>");
					} else {
					  html.push("<tr><td>", prefix, "<b>", jQuery.sap.escapeHTML(serialize(i)), "</b></td><td></td></tr>");
					  list(v, prefix + "&nbsp;&nbsp;");
					}
				});
				if ( !prefix) {
					html.push("</table>");
				}
			}
	
			var ojQSData = this._ojQSData = callback() || {};
	
			var bCT=false,bLV=false,bEmbedded=true;
			if ( jQuery.sap.getObject("sap.ui.debug.DebugEnv") ) {
				bCT = sap.ui.debug.DebugEnv.getInstance().isControlTreeShown();
				bLV = sap.ui.debug.DebugEnv.getInstance().isTraceWindowShown();
				bEmbedded = sap.ui.debug.DebugEnv.getInstance().isRunningEmbedded();
			}
			var sDCUrl = "/sapui5-internal/download/index.jsp";
			var bDC = jQuery.sap.syncHead(sDCUrl);
			var sDbgModeUrl = jQuery.sap.getModulePath(DBG_MODE_URL);
			var bUseDbgSrc = "true" === jQuery.sap.syncGetText(sDbgModeUrl, {}, "false"); // does not differentiate between "no debug mode" and "no support for debug mode"
			var sWeinreId = jQuery.sap.uid();
			var sWeinreClientUrl = sap.ui.getCore().getConfiguration().getWeinreServer() + "/client/#" + sWeinreId;
			{
				var html=[];
				html.push("<div id='sap-ui-techinfo' class='sapUiTInf sapUiDlg' style='width:640px; position: relative;'>");
				html.push("<table border='0' cellpadding='3'>");
				html.push("<tr><td align='right' valign='top'><b>SAPUI5 Version</b></td><td>", sap.ui.version, " (build at ", sap.ui.buildinfo.buildtime, ", last change ", sap.ui.buildinfo.lastchange, ")</td></tr>");
				html.push("<tr><td align='right' valign='top'><b>User Agent</b></td><td>", navigator.userAgent, (document.documentMode? ", Document Mode '" + document.documentMode + "'" : ""), "</td></tr>");
				html.push("<tr><td align='right' valign='top'><b>Configuration</b></td><td class='sapUiTInfCfg'>");
				list(ojQSData.config);
				html.push("</td></tr>");
				html.push("<tr><td align='right' valign='top'><b>Loaded Modules</b></td><td><div id='sap-ui-techinfo-modules' class='sapUiTInfMList'>");
				this._renderModules(html, 20);
				html.push("</div></td></tr>");
				if ( bDC ) {
					html.push("<tr><td></td><td><a id=\"sap-ui-techinfo-customModule\" href=\"" + sDCUrl + "\">Create Custom Bootstrap Module</a></td></tr>");
				}
				html.push("<tr><td align='right' valign='top' rowSpan='3'><b>Debug Tools</b></td>", "<td><input id='sap-ui-techinfo-useDbgSources' type='checkbox'",
						bUseDbgSrc?" checked='checked'":"",
						"><span ",
						">Use Debug Sources (clear cache + reload)</span></input></td></tr>");
				html.push("<tr><td><input id='sap-ui-techinfo-showControls' type='checkbox'",
						bCT?" checked='checked'":"",
						bEmbedded?"":" readonly='readonly'",
						"><span ",
						bEmbedded?"":" style='color:grey'",
						">Show UIAreas, Controls and Properties</span></input></td></tr>");
				html.push("<tr><td><input id='sap-ui-techinfo-showLogViewer' type='checkbox' ",
						bLV?" checked='checked'":"",
						bEmbedded?"":" readonly='readonly' style='color:grey'",
						"><span ",
						bEmbedded?"":" style='color:grey'",
						">Show Log Viewer</span></input></td></tr>");
				html.push("<tr><td colspan='2' align='center' valign='bottom' height='40'><button id='sap-ui-techinfo-close' class='sapUiBtn sapUiBtnS sapUiBtnNorm sapUiBtnStd'>Close</button></td></tr>");
				html.push("</table>");
				if ( bDC ) {
					html.push("<form id=\"sap-ui-techinfo-submit\" target=\"_blank\" method=\"post\" action=\"" + sDCUrl + "\">");
					html.push("<input type=\"hidden\" name=\"modules\"/>");
					html.push("</form>");
				}
				html.push("<div style='position: absolute; bottom: 5px; right: 5px;'>");
				html.push("<canvas id='sap-ui-techinfo-qrcode'></canvas>");
				html.push("<br><a id='sap-ui-techinfo-weinre' href=\"" + sWeinreClientUrl + "\" target=\"_blank\">Remote Web Inspector</a>");
				html.push("</div></div>");
				this._$Ref = jQuery(html.join(""));
				this._$Ref.find('#sap-ui-techinfo-useDbgSources').click(jQuery.proxy(this.onUseDbgSources, this));
				this._$Ref.find('#sap-ui-techinfo-showControls').click(jQuery.proxy(this.onShowControls, this));
				this._$Ref.find('#sap-ui-techinfo-showLogViewer').click(jQuery.proxy(this.onShowLogViewer, this));
				this._$Ref.find('#sap-ui-techinfo-more').click(jQuery.proxy(this.onShowAllModules, this));
				this._$Ref.find('#sap-ui-techinfo-close').click(jQuery.proxy(this.close, this));
				this._$Ref.find('#sap-ui-techinfo-customModule').click(jQuery.proxy(this.onCreateCustomModule, this));
				this._$Ref.find('#sap-ui-techinfo-weinre').click(jQuery.proxy(this.onOpenWebInspector, this));
			}
			this._oPopup = new sap.ui.core.Popup(this._$Ref.get(0), /*modal*/true, /*shadow*/true, /*autoClose*/false);
			var bValidBrowser = !jQuery.browser.msie || jQuery.browser.msie && jQuery.browser.version > 8;
			var bDevAvailable = bValidBrowser && jQuery.sap.sjax({type: "HEAD", url: sap.ui.resource("sap.ui.dev", "library.js")}).success;
			if (bDevAvailable) {
				var that = this;
				this._oPopup.attachOpened(function(oEvent) {
					var sAbsUrl = window.location.href,
						sWeinreTargetUrl = sAbsUrl + (sAbsUrl.indexOf("?") > 0 ? "&" : "?") + "sap-ui-weinreId=" + sWeinreId; 
					jQuery.sap.require("sap.ui.dev.qrcode.QRCode");
					if (sap.ui.dev.qrcode.QRCode._renderQRCode) {
						sap.ui.dev.qrcode.QRCode._renderQRCode(jQuery.sap.domById("sap-ui-techinfo-qrcode"), sWeinreTargetUrl);
					}
				});
			}
			this._oPopup.open(400);
		},
	
		close : function() {
			this._oPopup.destroy();
			this._oPopup = undefined;
			this._$Ref.remove();
			this._$Ref = undefined;
			this._ojQSData = undefined;
		},
	
		_renderModules : function(html, iLimit) {
			var modules = this._ojQSData.modules;
			var modnames=[]; jQuery.each(modules, function(i,v) { modnames.push(i); }); modnames.sort();
			var iMore = (iLimit && modnames.length > iLimit) ? modnames.length - iLimit : 0;
			if ( iMore ) {
				modnames.sort(function(a,b) {
					if ( a === b ) {
						return 0;
					}
					var ia = modules[a].url?1:0;
					var ib = modules[b].url?1:0;
					if ( ia != ib ) {
						return ib-ia;
					}
					return a < b ? -1 : 1;
				});
				modnames = modnames.slice(0, iLimit);
			}
			jQuery.each(modnames, function(i,v) {
				var mod = modules[v];
				html.push("<span",
						" title='", mod.url ? jQuery.sap.escapeHTML(mod.url): ("embedded in " + mod.parent), "'",
						" class='",
						  mod.url ? "" : " sapUiTInfMEmbd",
						  mod.state!=="ready" ? " sapUiTInfMFail":"",
						"'>", v, "</span>, ");
			});
			if ( iMore ) {
				html.push("<span id='sap-ui-techinfo-more' title='Show all modules' class='sapUiTInfMMore'>...(" + iMore + " more)</span>");
			};
		},
	
		onShowAllModules : function(e) {
			var html = [];
			this._renderModules(html, 0);
			this._$Ref.find("[id=sap-ui-techinfo-modules]").html(html.join(""));
		},
	
		onCreateCustomModule : function(e) {
			e.preventDefault();
			e.stopPropagation();
			var modnames=[]; jQuery.each(this._ojQSData.modules, function(i,v) { modnames.push(i); }); modnames.sort();
			jQuery("input[name='modules']", this._$Ref).attr("value", modnames.join(","));
			jQuery("form", this._$Ref)[0].submit();
		},
	
		ensureDebugEnv : function(bShowControls) {
			if ( !jQuery.sap.getObject("sap.ui.debug.DebugEnv") ) {
				try {
					jQuery.sap.require("sap-ui-debug");
					// when sap-ui-debug is loaded, control tree and property list are shown by defualt
					// so disable them again if they are not desired
					if ( !bShowControls ) {
						sap.ui.debug.DebugEnv.getInstance().hideControlTree();
						sap.ui.debug.DebugEnv.getInstance().hidePropertyList();
					}
				} catch(e) {
					// failed to load debug env (not installed?)
					return false;
				}
			}
			return true;
		},
	
		onShowControls : function(e) {
			if ( e.target.readOnly ) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}
			if ( this.ensureDebugEnv(true) ) {
				if ( e.target.checked ) {
					sap.ui.debug.DebugEnv.getInstance().showControlTree();
					sap.ui.debug.DebugEnv.getInstance().showPropertyList();
				} else {
					sap.ui.debug.DebugEnv.getInstance().hideControlTree();
					sap.ui.debug.DebugEnv.getInstance().hidePropertyList();
				}
			}
		},
	
		onShowLogViewer : function(e) {
			if ( e.target.readOnly ) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}
			if ( this.ensureDebugEnv(false) ) {
				if ( e.target.checked ) {
					sap.ui.debug.DebugEnv.getInstance().showTraceWindow();
				} else {
					sap.ui.debug.DebugEnv.getInstance().hideTraceWindow();
				}
			}
		},
	
		onUseDbgSources : function(e) {
			var sDbgModeUrl = jQuery.sap.getModulePath(DBG_MODE_URL),
				bUsesDbgSrc = "true" === jQuery.sap.syncGetText(sDbgModeUrl, { mode : e.target.checked }, "false");
			
			alert("Usage of debug sources is " + (bUsesDbgSrc ? "on" : "off") + " now.\nFor the change to take effect, you need to clear the browser cache and reload the page");
		},
		
		onOpenWebInspector: function(e) {
			if (!sap.ui.getCore().getConfiguration().getWeinreServer()) {
				alert("Cannot start Web Inspector - WEINRE server is not configured.");
				e.preventDefault();
			}
			else if (!jQuery.browser.webkit) {
				alert("Cannot start Web Inspector - WEINRE only runs on WebKit, please use Chrome or Safari.");
				e.preventDefault();
			}
		}
	
	
	};

}());
