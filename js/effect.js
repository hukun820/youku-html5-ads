(function(win, undefined) {
	var doc = win.document;

	var $ = function(p) {
		if (typeof p == 'object')
			return p;
		return doc.getElementById(p);
	};
	var getStyle = function(elm) {
		if (win.getComputedStyle)
			return getComputedStyle($(elm), null);
		else
			return elm.currentStyle;
	};
	var getAlpha = function(elm) {
		var _style = getStyle(elm);
		if (win.getComputedStyle) {
			if (typeof _style.opacity != 'undefined') 
				return Math.round(_style.opacity*100);
			else
				return 100;
		} else {
			var _alpha = _style.filter.replace(' '/g, '');
			if (_alpha == undef)
				return 100;
			var _start = _alpha.indexOf('opacity=');
			if (_start<0)
				return 100;
			_alpha = _alpha.substr(_start, 11);
			var _reg = new RegExp('[^\\d]*', 'g');
			return parseInt(_alpha.replace(_reg, ''));
		}
	};
	var setAlpha = function(elm, alpha) {
		alpha = alpha>=100 ? 100 : (alpha<=0 ? 0 : alpha);
		var _alpha = alpha/100;
		$(elm).style.filter = 'Alpha(opacity='+alpha+')';
		$(elm).style.opacity = _alpha;
	};
	var getVisualSize = function() {
		return {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight
		}
	};


	var effect = function() {
		var _speed_default = 200;
		var _cycel = 50;
		var _cycel_move = 20;
		var _increment_max = 100;

		var _is_exists = function(type) {
			return new Function('if('+type+') return true; else return false;');
		};

		//get increment
		var _get_increment = function(current, dest, speed, cycel) {
			current = (current.toString().replace('px', ''))*1;
			dest = (dest.toString().replace('px', ''))*1;
			var _speed = speed || _speed_default;
			var _res = (dest-current)/(_speed/cycel-1);
			if (dest > current)
				return Math.ceil(_res);
			else
				return Math.floor(_res);
		};

		var alpha_handle = function(elm) {
			var alpha = {};
			alpha.fade = function(type) {
				var alpha_inaction = 0,
				alpha_interval = null,
				alpha_dest = 0,
				action_increment = 0;

				var interval = function(func) {
					var alpha = getAlpha(elm);
					var alpha_new = alpha+action_increment;
					if (alpha_new>=100 || alpha_new<=0) {
						clearInterval(alpha_interval);
						alpha_interval = null;
						setAlpha(elm, alpha_dest);
						if (alpha_dest == 0)
							elm.style.display = 'none';
						if (typeof func == 'function') {
							func();
						}
						alpha_inaction = 0;
					} else {
						setAlpha(elm, alpha_new);
					}
				};

				return function(speed, func) {
					if (alpha_inaction)
						clearInterval(alpha_interval);
					alpha_interval = null;
					alpha_inaction = 1;
					var _style = getStyle(elm);
					var _alpha = getAlpha(elm);
					var _display = _style.display == undefined ? 'block' : _style.display;
					alpha_dest = type=='in' ? 100 : 0;
					action_increment = _get_increment(_alpha, alpha_dest, speed, _cycel);
					if (_display == 'none' && type == 'in')
						elm.style.display = 'block';
					alpha_interval = setInterval(function() {
						interval(func);
					}, _cycel);
				};

			};
			return alpha;
		};


		var move_handle = function(elm) {
			var alias = {
				'margin': {
					'left': 'marginLeft',
					'top': 'marginTop',
					'right': 'marginRight',
					'bottom': 'marginBottom'
				},
				'abs': {
					'left': 'left',
					'top': 'top',
					'right': 'right',
					'bottom': 'bottom'
				}
			};
			var get_style_key = function(type, key) {
				if (typeof alias[type] == 'object') {
					if (typeof alias[type][key] == 'string')
						return alias[type][key];
				}
				return null;
			};
			var get_center = function() {
				var _width = elm.clientWidth;
				var _height = elm.clientHeight;
				var _size = getVisualSize();
				var _st = doc.documentElement.scrollTop || win.pageYOffset || doc.body.scrollTop;
				return {left: (_size.width-_width)/2, top: (_size.height-_height)/2+_st};
			};
			var move = {
			};
			move.set_pos = function() {
				return function(pos) {
					if (typeof pos != 'object' && pos != 'center')
						return;
					if (pos == 'center') {
						var _pos = get_center();
						_elm.style.right = 'auto';
						_elm.style.bottom = 'auto';
						_elm.style.left = _pos.left+'px';
						_elm.style.top = _pos.top+'px';
						return;
					}
					var _left = pos.left == undefined ? null : pos.left;
					var _top = pos.top == undefined ? null : pos.top;
					var _right = pos.right == undefined ? null : pos.right;
					var _bottom = pos.bottom == undefined ? null : pos.bottom;
					if (_left != null)
						elm.style.left = pos.left+'px';
					if (_top != null)
						elm.style.top = pos.top+'px';
					if (_right != null)
						elm.style.right = pos.right+'px';
					if (_bottom != null)
						elm.style.bottom = pos.bottom+'px';
				};
			};
			move.get_move = function(type) {
				var move_inaction = 0,
				move_increment = {},
				move_interval = null,
				move_dest = {},
				move_type = 0;

				var move_list = [];
				var move_list_obj = {};

				var interval = function(func) {
					var _style = getStyle(elm);
					var _complete = 0;
					var _count = 0;
					for (var i in move_list) {
						//var _key = get_style_key(type, move_list[i]);
						var _key = move_list[i];
						var tmp = _style[_key] || 0;
						if (tmp == 'auto') tmp = 0;
						tmp = (tmp.toString().replace('px', ''))*1;
						if (move_type == 0)
							tmp += move_increment[_key];
						else if (move_type == 1) {
							var _tmp = (move_dest[_key]-tmp)*0.18;
							while(_tmp>_increment_max) 
								_tmp = _tmp/2;
							if (move_dest[_key]>move_list_obj[_key].old)
								tmp += Math.ceil(_tmp);
							else
								tmp += Math.floor(_tmp);
						}
						if ((move_increment[_key]>0 && tmp>=move_dest[_key]) || (move_increment[_key]<0 && tmp<=move_dest[_key]) || move_increment[_key] == 0) {
							tmp = move_dest[_key];
							_complete += 1;
						}
						elm.style[_key] = tmp+'px';
						_count++;
					}
					if (_complete === _count) {
						clearInterval(move_interval);
						move_interval = null;
						move_list.length = 0;
						move_list_obj.length = 0;
						if (typeof func == 'function')
							func();
					}

				};


				return function(dest, speed, action_type, func) {
					if (move_interval) {
						clearInterval(move_interval);
						move_interval = null
					}
					if (dest == 'center') 
						dest = get_center();
					//move_dest = dest;
					move_type = action_type || 0;
					var _style = getStyle(elm);
					for (var i in dest) {
						var _key = get_style_key(type, i);
						if (_key) {
							move_dest[_key] = dest[i];
							move_list.push(_key);
							move_list_obj[_key] = {};
							move_list_obj[_key].dest = dest[i];
							move_list_obj[_key].old = _style[_key] || 0;
							move_list_obj[_key].old = (move_list_obj[_key].old.toString().replace('px', ''))*1;
							move_increment[_key] = _get_increment(move_list_obj[_key].old, move_list_obj[_key].dest, speed, _cycel_move);
						}
					}
					move_interval = setInterval(function() {
						interval(func);
					}, _cycel_move);
					
				};
			};
			return move;
		};

		var resize_handle = function(elm) {
			var size = {};
			size.widthTo = function() {
				var size_interval;
				return function(dest, speed, fn) {
					if (size_interval) {
						clearInterval(size_interval);
						size_interval = null;
					}
					var style = getStyle(elm);
					var width = style['width'] != '' ? style['width'] : elm.clientWidth;
					var increment = _get_increment(width, dest, speed, _cycel_move);
					size_interval = setInterval(function() {
						var width = style['width'] != '' ? style['width'] : elm.clientWidth;
						width = width.toString().replace('px', '')*1;
						if ((increment < 0 && width == dest) || (increment > 0 && width >= dest)) {
							clearInterval(size_interval);
							size_interval = null;
							if (typeof fn == 'function')
								fn();
							return;
						}
						elm.style.width = (width + increment) + "px";
					}, _cycel_move);
				};
			};
			size.heightTo = function() {
				var size_interval;
				return function(dest, speed, fn) {
					if (size_interval) {
						clearInterval(size_interval);
						size_interval = null;
					}
					var style = getStyle(elm);
					var height = style['height'] != '' ? style['height'] : elm.clientHeight;
					var increment = _get_increment(height, dest, speed, _cycel_move);
					size_interval = setInterval(function() {
						var height = style['height'] != '' ? style['height'] : elm.clientHeight;
						height = height.toString().replace('px', '')*1;
						if ((increment < 0 && height == dest) || (increment > 0 && height >= dest)) {
							clearInterval(size_interval);
							size_interval = null;
							if (typeof fn == 'function')
								fn();
							return;
						}
						elm.style.height = (height + increment) + "px";
					}, _cycel_move);
				};
			};
			size.resizeTo = function() {
				return function(dest, speed, fn) {
					elm.widthTo(dest.width, speed);
					elm.heightTo(dest.height, speed);
					setTimeout(fn, speed + 10);
				}
			}
			return size;
		};


		var effect_list = {
			alpha:{
				bind:function(elm) {
					var _alpha = alpha_handle(elm);
					elm.fadeIn = _alpha.fade('in');
					elm.fadeOut = _alpha.fade('out');
				},
				get:function(elm) {
					var _alpha = alpha_handle(elm);
					return {
						fadeIn: _alpha.fade('in'),
						fadeOut: _alpha.fade('out')
					};
				}
			},
			move:{
				bind:function(elm) {
					var _move = move_handle(elm);
					elm.setPos = _move.set_pos();
					elm.moveTo = _move.get_move('abs');
					elm.marginTo = _move.get_move('margin');
				},
				get:function(elm) {
					var _move = move_handle(elm);
					return {
						setPos: _move.set_pos(),
						moveTo: _move.get_move('abs'),
						marginTo: _move.get_move('margin')
					};
				}
			},
			resize:{
				bind:function(elm) {
					var _size = resize_handle(elm);
					elm.sizeTo = _size.resizeTo();
					elm.widthTo = _size.widthTo();
					elm.heightTo = _size.heightTo();
				},
				get:function(elm) {
					var _size = resize_handle(elm);
					return {
						sizeTo: _size.resizeTo(),
						widthTo: _size.widthTo(),
						heightTo: _size.heightTo()
					};
				}
			}
		};


		//get alll effect
		var get_all_effect = function(elm) {
			var _effect = [];
			_effect.push(effect_list.alpha.get(elm));
			_effect.push(effect_list.move.get(elm));
			_effect.push(effect_list.resize.get(elm));
			var _effect_final = {};
			for(var i in _effect) {
				for(var j in _effect[i]) {
					_effect_final[j] = _effect[i][j];
				}
			}
			return _effect_final;
		};



		return {
			bind:function(element, type) {
				if (!$(element))
					return error('not found element in effect bind ['+element+']');
				if (type == undefined) {
					for (var i in effect_list)
						effect_list[i].bind(element);
				} else {
					if (effect_list[type] && typeof effect_list[type].bind == 'function')
						effect_list[type].bind(element);
				}
			},
			get: function(element, type) {
				if (!$(element))
					return error('not found element in effect bind ['+element+']');
				if (type == undefined || type == 'all')
					return get_all_effect(element);
				else {
					if (effect_list[type] && typeof effect_list[type].get == 'function')
						return effect_list[type].get(element);
				}

			}
		}
	};

	if (typeof win.Modules != 'object')
		win.Modules = {};
	win.Modules.Effect = effect();
})(window);
