/**
 * HTTP Request Helper
 */

/**
 * Standard HTTP Request
 * @param {Object} _params
 * @description The following are valid options to pass through:
 *  _params.timeout  	: int Timeout request
 *  _params.type		: string GET/POST
 *  _params.format		: string json, etc.
 *  _params.data		: mixed The data to pass
 *  _params.url			: string The url source to call
 *  _params.failure		: funtion A function to execute when there is an XHR error
 *  _params.success		: function when successful
 *  _params.passthrough : Any passthrough params
 *  _params.headers     : Array of request headers
 */
if (typeof Alloy === 'undefined') {
    var Alloy = require('alloy');
}
if (typeof Backbone === 'undefined') {
    var Backbone = require('alloy/backbone');
}
if (typeof _ === 'undefined') {
    var _ = require('alloy/underscore')._;
}

exports.request = function(_params) {
	if(Ti.Network.online) {
		// Setup the xhr object
		var xhr = Ti.Network.createHTTPClient();

		// Set the timeout or a default if one is not provided
		xhr.timeout = _params.timeout ? _params.timeout : 10000;

		// For mobile web CORs
		if(Ti.Platform.osname === "mobileweb") {
			xhr.withCredentials = true;
		}

		/**
		 * When XHR request is loaded
		 */
		xhr.onload = function(_data) {
			if(_data) {
				_data = _params.format === "json" ? JSON.parse(this.responseText) : this.responseData;
				if(xhr.getResponseHeaders) {
					var headers = xhr.getResponseHeaders();
				}

				if(_params.success) {
					if(_params.passthrough) {
						_params.success(_data, headers, _params.passthrough);
					} else {
						_params.success(_data, headers);
					}
				} else {
					return _data;
				}
			}
		};

		if(_params.ondatastream) {
			xhr.ondatastream = function(_event) {
				if(_params.ondatastream) {
					_params.ondatastream(_event.progress);
				}
			};
		}

		/**
		 * Error handling
		 * @param {Object} _event The callback object
		 */
		xhr.onerror = function(_event) {
			if(_params.failure) {
				_params.failure(this.responseText);
			} else {
				Ti.API.error(JSON.stringify(this))
			}
		};

		// Open the remote connection
		_params.type = _params.type ? _params.type : "GET";
		_params.async = _params.async ? _params.async : true;

		xhr.open(_params.type, _params.url, _params.async);

		if(_params.headers) {
			for(var i = 0, j = _params.headers.length; i < j; i++) {
				xhr.setRequestHeader(_params.headers[i].name, _params.headers[i].value);
			}
		}

		if(_params.data) {
			// send the data
			xhr.send(_params.data);
		} else {
			xhr.send();
		}
	} else {
		Ti.API.info("No internet connection");
	}
};