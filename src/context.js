exports.create = function(raw, options, regex) {
	var index = 0,
		substring = null;

	var context = {
		text: '',
		peek: function(count) {
			count = count || 1;
			return this.raw.substr(this.index + 1, count);
		},
		read: function(count) {
			if (count === 0) {
				return '';
			}
			count = count || 1;
			var next = this.peek(count);
			this.index += count;
			if (this.index > this.length) {
				this.index = this.length;
			}
			return next;
		},
		readUntilNonWhitespace: function() {
			var value = '', next;
			while (!this.isEof()) {
				next = this.read();
				value += next;
				if (!/\s$/.test(value)) {
					break;
				}
			}

			return value;
		},
		isEof: function() {
			return this.index >= this.length;
		},
		readRegex: function(regex) {
			var value = (regex.exec(this.raw.substring(this.index)) || [''])[0];
			this.index += value.length;
			return value;
		},
		peekIgnoreWhitespace: function(count) {
			count = count || 1;
			var value = '', next = '', offset = 0;
			do {
				next = this.raw.charAt(this.index + ++offset);
				if (!next) {
					break;
				}
				if (!/\s/.test(next)) {
					value += next;
				}
			} while (value.length < count);

			return value;
		}
	};

	context.__defineGetter__('current', function() {
		return this.isEof() ? '' : this.raw.charAt(this.index);
	});
	context.__defineGetter__('raw', function() {
		return raw;
	});
	context.__defineGetter__('length', function() {
		return this.raw.length;
	});
	context.__defineGetter__('index', function() {
		return index;
	});
	context.__defineSetter__('index', function(value) {
		index = value;
		substring = null;
	});
	context.__defineGetter__('substring', function() {
		return substring === null ? (substring = this.raw.substring(this.index)) : substring;
	});

	context.callbacks = {};
	var types = [ 'openElement', 'closeElement', 'attribute', 'comment', 'cdata', 'text', 'docType', 'xmlProlog', 'closeOpenedElement' ];
	types.forEach(function(value) {
		context.callbacks[value] = options[value] || function() {
		};
	});

	context.regex = {
		name: /[a-zA-Z_][\w:\-\.]*/,
		attribute: /[a-zA-Z_][\w:\-\.]*/
	};
	regex = regex || {};
	for (var name in regex) {
		if (regex.hasOwnProperty(name)) {
			context.regex[name] = regex[name];
		}
	}

	return context;
};