
var colorname=new Array();
var colornameRGB=new Array();
var coloramount=new Array();
var totalcoloramount=0;
var extractison=0;
;( function( window ) {
	
	'use strict';

	var support = { animations : Modernizr.cssanimations, filters : Modernizr.cssfilters },
		animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
		animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
		onEndAnimation = function( el, callback ) {
			var onEndCallbackFn = function( ev ) {
				if( support.animations ) {
					if( ev.target != this ) return;
					this.removeEventListener( animEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(); }
			};
			if( support.animations ) {
				el.addEventListener( animEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		},
		imgSlider,
		colorsCtrl = document.querySelector('.button-color'),
		paletteBoxes = [].slice.call(document.querySelectorAll('ul.palette > li.palette__item'));

	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function Slider(el, options) {
		this.el = el;
		this.options = extend( {}, this.options );
		extend( this.options, options );
		
		this.items = [].slice.call(this.el.querySelectorAll('.slider__item'));
		
		this.navRCtrl = this.el.querySelector('nav > .slider__nav--next');
		this.navLCtrl = this.el.querySelector('nav > .slider__nav--prev');
		
		this.itemsTotal = this.items.length;
		this.current = 0;

		this.isAnimating = false;

		this._init();
	}

	Slider.prototype.options = {
		onNavigate : function() { return false; }
	}

	Slider.prototype._init = function() {
		this.navRCtrl.addEventListener('click', this._next.bind(this));
		this.navLCtrl.addEventListener('click', this._prev.bind(this));
	};

	Slider.prototype._next = function() {
		this._navigate('right');
	};

	Slider.prototype._prev = function() {
		this._navigate('left');
	};

	Slider.prototype._navigate = function(dir) {
		if( this.isAnimating ) {
			return false;
		}

		this.options.onNavigate();

		this.isAnimating = true;

		var self = this,
			currentItem = this.items[this.current], nextItem;

		if( dir === 'right' ) {
			nextItem = this.current < this.itemsTotal - 1 ? this.items[this.current + 1] : this.items[0];
		}
		else {
			nextItem = this.current > 0 ? this.items[this.current - 1] : this.items[this.itemsTotal - 1];	
		}

		classie.add(this.el, dir === 'right' ? 'slider--show-next' : 'slider--show-prev');
		classie.add(currentItem, dir === 'right' ? 'slider__item--animOutNext' : 'slider__item--animOutPrev');
		classie.add(nextItem, dir === 'right' ? 'slider__item--animInNext' : 'slider__item--animInPrev');

		if( dir === 'right' ) {
			this.current = this.current < this.itemsTotal - 1 ? this.current + 1 : 0;
		}
		else {
			this.current = this.current > 0 ? this.current - 1 : this.itemsTotal - 1;
		}

		onEndAnimation(nextItem, function() {
			classie.remove(self.el, dir === 'right' ? 'slider--show-next' : 'slider--show-prev');
			classie.remove(currentItem, dir === 'right' ? 'slider__item--animOutNext' : 'slider__item--animOutPrev');
			classie.remove(currentItem, dir === 'right' ? 'slider__item--current' : 'slider__item--current');
			classie.remove(nextItem, dir === 'right' ? 'slider__item--animInNext' : 'slider__item--animInPrev');
			classie.add(nextItem, 'slider__item--current');
			self.isAnimating = false;
		});
	};

	Slider.prototype.getImage = function() {
		return this.items[this.current].querySelector('img');
	};

	function init() {
		var slider = document.getElementById('slider');
		
		// image slider
		imgSlider = new Slider(slider, {
			onNavigate : function() { // reset colors
				var ison = colorsCtrl.getAttribute('on');
				if( ison === 'on' ) {
					insertColors();
					colorsCtrl.setAttribute('on', 'off');
				}
			}
		});

		// css filters fallback
		if( !support.filters ) {
			[].slice.call(slider.querySelectorAll('img')).forEach(function(img) {
				// create SVG element
				var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg.setAttributeNS(null, 'version', '1.1');
				svg.setAttributeNS(null, 'preserveAspectRatio', 'xMaxYMin meet');
				svg.setAttributeNS(null, 'viewBox', '0 0 640 426');
				svg.setAttributeNS(null, 'width', '640px');
				svg.setAttributeNS(null, 'height', '426px');
				svg.setAttributeNS(null, 'class', 'slider__img-fallback');
				
				var svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
				svgimg.setAttributeNS(null,'height','100%');
				svgimg.setAttributeNS(null,'width','100%');
				svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href', img.src);
				svgimg.setAttributeNS(null, 'filter', 'url(#grayscale)');

				svg.appendChild(svgimg);
				img.parentNode.appendChild(svg);
			});
		}
		
		initEvents();
	}

	function initEvents() {
		// extract colors
		colorsCtrl.addEventListener('click', function() {
			if( imgSlider.isAnimating ) {
				return false;
			}
			var ison = colorsCtrl.getAttribute('on');
			if( ison === 'on' ) {
				insertColors();
			}
			else {
				extractColors();
				
			}
			colorsCtrl.setAttribute('on', ison === 'on' ? 'off' : 'on');
		});
	}

	function extractColors() {
		// get current slider image
		var imgEl = imgSlider.getImage(),
			addToPalette = function(palette,pos) {
				setTimeout(function() { 
					if( colorsCtrl.getAttribute('on') === 'on' ) { // make sure it's still on..
						classie.add(palette, 'palette__item--animate'); 
					}
				}, pos*150); // delays
			};

		var vibrant = new Vibrant(imgEl,64, 5), swatches = vibrant.swatches(), i = 0;
		for (var swatch in swatches) {
			var palette = paletteBoxes[i];
			if (swatches.hasOwnProperty(swatch) && swatches[swatch] && palette) {
				palette.style.color = swatches[swatch].getHex();
				palette.querySelector('.palette__value--real').innerHTML = swatches[swatch].getHex();
				colorname[i]=swatches[swatch].getHex();
				colornameRGB[i]=swatches[swatch].getRgb();
				coloramount[i]=swatches[swatch].getPopulation();
				addToPalette(palette, i);
				totalcoloramount= totalcoloramount+coloramount[i];
			}

			++i;
		}

		// css filters animation:
		classie.add(imgEl, 'slider__img--animate');
 		
		 
		
	var trNum = 0;
		 $("tr").each(function () {
        	$("td", this).text(coloramount[trNum]);
        	$("th", this).text(colorname[trNum]);
			trNum++;
    	});
		document.getElementById('holder').innerHTML="";
		$("td").change(createtable());
		$("td").change(createtable2());
	}

	function insertColors() {
		// get current slider image
		var imgEl = imgSlider.getImage(),
			removeFromPalette = function(palette,pos) {
				setTimeout(function() { classie.remove(palette, 'palette__item--animate'); }, (paletteBoxes.length - 1)*100 - pos*100);	
			};

		paletteBoxes.forEach(function(palette, i) {
			removeFromPalette(palette, i);
		});

		// css filters animation:
		classie.remove(imgEl, 'slider__img--animate');

	}

	function createtable(){
   		Raphael.fn.pieChart = function (cx, cy, r, values, labels, stroke) {
    		var paper = this,
        	rad = Math.PI / 180,
        	chart = this.set();
    	function sector(cx, cy, r, startAngle, endAngle, params) {
       	 var x1 = cx + r * Math.cos(-startAngle * rad),
            	x2 = cx + r * Math.cos(-endAngle * rad),
           	 	y1 = cy + r * Math.sin(-startAngle * rad),
            	y2 = cy + r * Math.sin(-endAngle * rad);
        	return paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
    }
    	var angle = 0,
        	total = 0,
        	start = 0,
        	process = function (j) {
            	var value = values[j],
                	angleplus = 360 * value / total,
                	popangle = angle + (angleplus / 2),
                	color = Raphael.hsb(start, .75, 1),
                	ms = 500,
                	delta = 30,
                	//bcolor = Raphael.hsb(start, 1, 1),
					bcolor = colorname[j],
                	//p = sector(cx, cy, r, angle, angle + angleplus, {fill: "90-" + bcolor + "-" + color, stroke: stroke, "stroke-width": 3}),
                	p = sector(cx, cy, r, angle, angle + angleplus, {fill: bcolor, stroke: stroke, "stroke-width": 3}),
					txt = paper.text(cx + (r + delta + 55) * Math.cos(-popangle * rad), cy + (r + delta + 25) * Math.sin(-popangle * rad), labels[j]).attr({fill: bcolor, stroke: "none", opacity: 0, "font-size": 20});
            	p.mouseover(function () {
                	p.stop().animate({transform: "s1.1 1.1 " + cx + " " + cy}, ms, "elastic");
                	txt.stop().animate({opacity: 1}, ms, "elastic");
            	}).mouseout(function () {
                	p.stop().animate({transform: ""}, ms, "elastic");
                	txt.stop().animate({opacity: 0}, ms);
            	});
            	angle += angleplus;
            	chart.push(p);
            	chart.push(txt);
            	start += .1;
        	};
    	for (var i = 0, ii = values.length; i < ii; i++) {
        	total += values[i];
		}
    	for (i = 0; i < ii; i++) {
        	process(i);
    	}
    	return chart;
};

$(function () {

    var values = [],
        labels = [];
    $("#pieChart tr").each(function () {
        values.push(parseInt($("td", this).text(), 10));
        labels.push($("th", this).text());
    });
    $("#pieChart").hide();
    Raphael("holder", 700, 700).pieChart(350, 350, 200, values, labels, "#fff");
});

}

	function createtable2(){
		

		//rgb转hex
		var rgbToHex = function(rgb) {
    		// rgb(x, y, z)
    		var color = rgb.toString().match(/\d+/g); // 把 x,y,z 推送到 color 数组里
    		var hex = "#";
    		for (var i = 0; i < 3; i++) {
        		hex += ("0" + Number(color[i]).toString(16)).slice(-2);
    		}
    	return hex;
		}

		//对比色表格
		var ContrastColor=new Array();
		var ContrastColorHex=new Array();
		for(var i=0; i<5; i++){
			ContrastColor[i] = new Array();
			for(var j=0; j<3;j++){
				ContrastColor[i][j] = 255-colornameRGB[i][j];
			}
			ContrastColorHex[i] = rgbToHex(ContrastColor[i]);
	
		}



		
		
		
		var thNum = 0;
		$("#colorChart tr").each(function () {
        	$("th", this).eq(0).css({"background-color":colorname[thNum],
									  "width":"150px",
									  "height":"60px",
									  "color":ContrastColorHex[thNum]
									});
			$("th", this).eq(0).text(colorname[thNum]);
			$("th", this).eq(1).css({"background-color": 'rgb('+ContrastColor[thNum][0]+','+ContrastColor[thNum][1]+','+ContrastColor[thNum][2]+')',//"rgb(255,255,0)",//"rgb(255-parseInt(colornameRGB[thNum][0]), 255-parseInt(colornameRGB[thNum][1]), 255-parseInt(colornameRGB[thNum][2]))",
									  "width":"150px",
									  "height":"60px",
									  "color":colorname[thNum]
									});
			$("th", this).eq(1).text(ContrastColorHex[thNum]);
			thNum++;
    	});

		


	}
	init();



})( window );