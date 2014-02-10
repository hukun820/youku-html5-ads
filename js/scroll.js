
(function(win, undef) {
	var scroll = function(box, bar ,listbox) {
		var doc = win.document;
		var len_list,len_listparent,len_box,len_scrollbtn;
		var scale;

		var btn = (function() {
			var allow_size = {};
			var curr_per = 0;
			var curr_y = 0;

			var stop_drag = function(e) {
				//console.log('onmouseout', e);
				doc.onmousemove = null;
				doc.onmouseup = null;
			};

			var drag_start = function(e) {
				var mouse_oy = e.clientY;
				var btn_oy = bar.style.top || 0;
				btn_oy = btn_oy.toString().replace('px', '')*1;
				doc.onselectstart = function() {
					return false;
				}
				doc.onmouseup = stop_drag;
				//doc.onmouseout = stop_drag;
				doc.onmousemove = function(e) {
					var _sub = e.clientY-mouse_oy;
					var _y = btn_oy+_sub;
					if (_y<allow_size.top) _y = allow_size.top;
					if (_y>allow_size.bottom) _y = allow_size.bottom;
					bar.style.top = _y+"px";
					curr_y = _y;
					curr_per = _y/(allow_size.bottom-allow_size.top);
					list.update_pos(curr_per);
				}
			};

			var bind_mouse_event = function() {
				bar.onmousedown = function(e) {
					e.preventDefault();
					drag_start(e);
				};
			};

			return {
				_up: function() {
					curr_y -= 10;
					if (curr_y < allow_size.top) curr_y = allow_size.top;
					bar.style.top = curr_y+"px";
					curr_per = curr_y/(allow_size.bottom-allow_size.top);
					list.update_pos(curr_per);
				},
				_down: function() {
					curr_y += 10;
					if (curr_y > allow_size.bottom) curr_y = allow_size.bottom;
					bar.style.top = curr_y+"px";
					curr_per = curr_y/(allow_size.bottom-allow_size.top);
					list.update_pos(curr_per);
				},
				init: function() {
					len_box = box.clientHeight;
					scale = len_listparent/len_list;
					len_btn = Math.round(len_scrollbox*scale);
					bar.style.height = len_scrollbtn+"px";
					allow_size.left = 0;
					allow_size.right = 0;
					allow_size.top = 0;
					allow_size.bottom = len_box-len_scrollbtn;
					bind_mouse_event();
				}
			}
		})();

		var list = (function() {
			var allow_size = {};
			var curr_per = 0;
			return {
				update_pos: function(p) {
					var _y = Math.round((allow_size.top-allow_size.bottom)*p);
					if (_y<allow_size.top) _y = allow_size.top;
					if (_y>allow_size.bottom) _y = allow_size.bottom;
					listbox.style.marginTop = _y+"px";
				},
				init: function(p) {
					len_listparent = listbox.parentNode.clientHeight;
					len_list = listbox.clientHeight;
					allow_size.left = 0;
					allow_size.right = 0;
					allow_size.top = -1*(len_list-len_listparent);
					allow_size.bottom = 0;
				}
			}
		})();
		
		var on_mouse_wheel = function(e) {
			e.preventDefault();
			if (e.wheelDelta>0)
				btn.scroll_up();
			else
				btn.scroll_down();
			return false;
		};
		var add_mouse_ = function() {
			listbox.onmouseover = function() {
				doc.addEventListener('mousewheel', on_mouse_wheel, true);
			};
			listbox.onmouseout = function() {
				doc.removeEventListener('mousewheel', on_mouse_wheel, true);
				//doc.onmousewheel = null;
			};
		};
		
		var init_data = function() {
			list.init();
			btn.init();
			add_mouse_();
			
		};
		return {
			bind: function() {
				init_data();
			}
		}
	};
	if (typeof win.Modules != 'object')
		win.Modules = {};
	win.Modules.Scroll = scroll;
})(window);

