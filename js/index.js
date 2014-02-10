(function(win, undefined) {
	var current_point,
		current_time,
		time_all,
		sint,
		data,
		video_title,
		item_list=[],
		is_first = 1,
		player_bak,
		doc = win.document;
	var templates_tb = '<a href="{link}" class="img_link" target="_blank"><img src="{thumb}" alt="" /></a><p><a href="{link}" target="blank">{title}</a></p><p class="price">{price}</p>';

	$(win).bind('resize', function() {
		$('#youkuplayer').height(Math.round($('#youkuplayer').width()*9/16));
		$('#list-item')[0].style.height = '100px';
		var h = document.body.clientHeight-100;
		$('#list-item')[0].style.height = h+'px';
	});


	$('#youkuplayer').height(Math.round($('#youkuplayer').width()*9/16));
	var h = document.body.clientHeight-100;
	$('#list-item')[0].style.height = h+'px';
	$('#list-item')[0].style.overflowY = 'auto';

	var isPad = function() {
		return navigator.userAgent.indexOf('iPad')>=0;
	}

	var until_handle = function(fn_case, fn_handle, fn_error) {
		var count = 0;
		var interval = setInterval(function() {
			if (fn_case() === true || count >= 40) {
				clearInterval(interval);
				interval = null;
				if (count < 40)
					fn_handle();
				if (count >=40 && typeof fn_error == 'function')
					fn_error();
			}
			count++;
		}, 250);
	};

	var data_find = function(time) {
		for(var i in data) {
			if (data[i].time - time <= 200 && data[i].time - time >= -200 && data[i].time != current_time) {
				current_time = data[i].time;
				return data[i];
			}
		}
		return false;
	};

	var data_show = function(data) {
		if (data === false) return;
		var keywords = data.title;
		timeline.show(data.time);
		detect.draw(data);
	};

	var parseTime = function(str) {
		var time = Math.round(str/1000);
		var h = Math.floor(time / 3600);
		var m = Math.floor(time / 60);
		var s = Math.round(time % 60);
		h = h < 10 ? '0' + h : h;
		m = m < 10 ? '0' + m : m;
		s = s < 10 ? '0' + s : s;
		return h + ':' + m + ':' + s;
	};

	var in_array = function(arr, value) {
		for (var i in arr) {
			if (arr[i] == value)
				return i;
		}
		return -1;
	};

	var get_abs = function(obj) {
		var _elm = typeof obj == 'object' ? obj : doc.getElementById(obj);
		var _l = _elm.offsetLeft;
		var _h = _elm.offsetTop;
		while (_elm = _elm.offsetParent) {
			_l += _elm.offsetLeft;
			_h += _elm.offsetTop;
		}
		return {
			left: _l,
			top: _h
		}
	};

	var taobao = (function() {
		var xh;
		var create_temp = function(d) {
			var li = doc.createElement('li');
			var html = templates_tb.replace(/{link}/g, d.link);
			html = html.replace(/{thumb}/g, d.image);
			
			html = html.replace(/{title}/g, d.title);
			html = html.replace(/{pv}/g, '');
			html = html.replace(/{price}/g, '类别：'+d.type);

			li.innerHTML = html;
			li.style.display = "none";
			return li;
		};
		var create = function(d) {
		};
		var get = function(d) {
			var li = create_temp(d);
			if (is_first) {
				$('#list-item').html('');
				is_first = 0;
				$('#list-item').append(li);
			} else
				$($('#list-item li')[0]).before(li);

			$(li).slideDown(500);
		};
		return {
			show: function(d) {
				get(d);
			}
		}
	})();

	var detect = (function() {
		var player = $('#youkuplayer')[0];
		var abs = get_abs('youkuplayer');
		var left = abs.left;
		var top = abs.top;
		var resize = function(d) {
			var nw = player.clientWidth;
			var nh = player.clientHeight;
			var ow = d.maxWidth || nw;
			var oh = d.maxHeight || nh;

			var h_sub = 0;

			var prop_w = nw/ow;
			var prop_h = nh/oh;

			var obj = {
				width: Math.round(prop_w*d.width) || nw,
				height: Math.round(prop_h*d.height) || nh,
				x: Math.round(prop_w*d.x),
				y: Math.round(prop_h*d.y)+h_sub,
			};
			return obj;
		};
		var create = function(d) {
			var over = doc.createElement('p');
			over.className = "tag-layer";
			over.style.left = (left + d.pos.x) + "px";
			over.style.top = (top + d.pos.y) + "px";
			over.style.width = d.pos.width + "px";
			over.style.height = d.pos.height + "px";
			over.innerHTML = d.title;
			return over;
		};

		var show = function(d) {
			var keywords = get_abs('keywords');
			var left = 0;
			var k_search = "";

			var index = in_array(item_list, d.title);
			d.pos = resize(d.pos);
			var elm = create(d);
			win.Modules.Effect.bind(elm);
			doc.body.appendChild(elm);
			elm.style.opacity = 1;
			var elm_bak;
			if (index == -1) {
				elm_bak = create(d);
				elm_bak.className = "tag-layer-static";
				elm_bak.style.position = "static";
				elm_bak.style.width = "auto";
				elm_bak.style.height = "auto";
				elm_bak.style.visibility = "hidden";
				elm_bak.style.float = "left";
				$('#keywords').append(elm_bak);
				item_list.push(d.title);
				setTimeout((function(data){
					return function() {
						taobao.show(d);
					}
				})(d), 1500);
				/* 点击关键字
				elm_bak.onclick = function() {
					//souku.show(this.innerHTML);
					taobao.show(this.innerHTML);
				}
				*/
			} else {
				var lists = $('#keywords p').get();
				elm_bak = lists[index];
			}
			setTimeout((function(_elm, _left, _elm_bak, index) {
				var elm_bak_pos = get_abs(_elm_bak);
				var dest = {
					width: $('#list-item li')[0].clientWidth,
					height: index>-1 ? $('#list-item li')[0].clientHeight : 0
				};
				var abs = get_abs($('#list-item')[0]);
				var top = abs.top+10;
				if (index > -1)
					top += (item_list.length-index-1)*$('#list-item li')[0].clientHeight;
				

				return function() {
					_elm.moveTo({
						left: abs.left+10,
						top: top
					}, 500, 1);
					_elm.fadeOut(600);
					_elm.sizeTo(dest, 500, function() {
						doc.body.removeChild(_elm);
						_elm_bak.style.visibility = "visible";
					});
				};
			})(elm, left, elm_bak, index), 800);
			left += elm_bak.clientWidth + 10;

			k_search += d.title + " ";

		};
		return {
			draw: function(data) {
				show(data);
			}
		};
	})();

	var timeline = (function() {
		var createbg = function() {
			var line = doc.createElement('i');
			line.className = 'timeline-bg';
			return line;
		}
		var createpoint = function(data, totaltime) {
			var keywords = '';
			var str = '';
			var left = Math.round(data.time/totaltime*100);
			for (var i=0; i< data.pos.length; i++) {
				if (i>0) str = ' ';
				keywords += i + data.title
			}
			var a = doc.createElement('a');
			a.className = 'timeline-point action-default';
			a.style.left = "0%";
			setTimeout(function() {
				a.style.left = left + '%';
			}, 100);
			a.id = 'point-' + data.time;
			a.title = parseTime(data.time)+' '+data.title;
			a.setAttribute('time', data.time);
			a.onclick = function() {
				var time = this.getAttribute('time');
				player_bak.seekTo(time/1000-2);
			};
			return a;
		}
		var drawline = function(data, totaltime) {
			var box = $('#timeline');
			box.append(createbg());
			for (var i in data) {
				box.append(createpoint(data[i], totaltime));
			};
		}
		var show = function(time) {
			if (current_point)
				current_point.className = 'timeline-point action-default';
			$('#point-' + time)[0].className = 'timeline-point action-default selected';
			current_point = $('#point-' + time)[0];
		}
		return {
			draw: function(data, totaltime) {
				drawline(data, totaltime);
			},
			show: function(time) {
				show(time);
			}
		};
	})();

	var interval_start = function() {
		until_handle(function() {
			//var swf = $('#youku-player')[0];
				//alert(player.playVideo());
			if (player_bak && typeof player_bak.currentTime != 'undefined' && player_bak.currentTime()) {
				if (player_bak.currentTime() != 0) {
					return true;
				}
				return false;
			}
			return false;
		}, function() {
			//var swf = $('#youku-player')[0];
			timeline.draw(data, time_all*1000);
			sint = setInterval(function() {
				//var swf = $('#youku-player')[0];
				//var nsdata = swf.getNsData();
				var time = player_bak.currentTime();
				if (time != 0 && time == time_all) {
					clearInterval(sint);
					sint = null;
					return;
				}
				data_show(data_find(Math.round(player_bak.currentTime()*1000)));
			}, 100);
		});
	}

	var init = function(vid) {
		$.get('ajax.php', {a:'tb', q:vid}, function(d) {
			data = new Function('return '+d)();
			interval_start();
		});
	}

	win.initplayer = function(vid, title, alltime) {
		var events = isPad() ? {
			onPlayStart: function () {
				setTimeout(function(){
					init(vid);
				}, 16000);
			}
		} : '';
		win.player = new YKU.Player('youkuplayer', {
			client_id: '9266b5c9362fc15c',
			vid: vid,
			width: '100%',
			height: '100%',
			autoplay: true,
			flashext: '<param name=wmode value=transparent>',
			show_related: false,
			events: events
		});
		player_bak = win.player;

		time_all = alltime;
		video_title = title.replace(/[\d\s]*/g, '');
		if (!isPad())
			init(vid);
	}
})(window);
