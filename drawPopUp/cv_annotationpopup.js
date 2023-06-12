var CV = CV || {};

(function(namespace) {
	'use strict';

	/**
	 * カット＆ペーストリクエストマネージャー.
	 */
    namespace.AnnotationPopUpImage = (function() {
        var constructor = function(param) {

			this.reset();
		}

        var pt = constructor.prototype;

		/**
		 * 定数.
		 */
		const _kMarginStr   = 4; // 文字の外の余白.
		const _kMarginBuble = 4; // 吹き出しの外の余白.

		/**
		 * リセット.
		 */
		pt.reset = function() {
			this.popUpImage = null;
			this.fontSize   = 16;
			this.text       = '日本語のポップアップ';
			this.pos        = "up"; // ポップ表示位置(up,down.left,right).
		}

		/**
		 *  ポップアップ画像を取得する.
		 */
		pt.getImage = function() {
			return this.popUpImage;
		}

		/**
		 * ポップアップ画像を生成する.
		 */
		pt.createImage = function() {
			let canvas	   = document.createElement('canvas');
			let	  ctx	   = canvas.getContext('2d');
			const text     = '日本語のポップアップ';

			let strSize = this.drawString(ctx, text, 0, 0, false); // 文字列の描画サイズを取得.

			const mgn  = _kMarginStr; // 文字まわりのマージン

			let info = {};
			info.w  = strSize[0] + mgn*2; // 300;
			info.h  = strSize[1] + mgn*2; // 100;
			info.x0 = 0;
			info.y0 = 0;
			info.fl = 50;// 吹き出しの長さ.
			info.f0 = 0.4; // 吹き出しの位置さ.
			info.f1 = 0.5;
			// info.dir = "up"; // "down";

			// 吹き出しのbboxを取得.
			let bb = this.drawFukidaShi(ctx, info, 0, 0, false);

			canvas.width  = bb.maxx - bb.minx + mgn*2;
			canvas.height = bb.maxy - bb.miny + mgn*2;
			ctx           = canvas.getContext('2d');

			// クリア
			ctx.fillStyle = "rgb(255,  128, 0)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			// ctx.clearRect(0, 0, width, height);

			const offsetx = -bb.minx + _kMarginBuble; // 吹き出しまわりのマージン.
			const offsety = -bb.miny + _kMarginBuble;

			this.drawFukidaShi(ctx, info, offsetx, offsety);

			this.drawString(ctx, text, offsetx + mgn, offsety + mgn);

			// Image生成.
			let image = new Image();
			image.src = canvas.toDataURL();
			image.onload = ()=>{
				// console.log("test Image load done. : " + text0);
			};
			this.popUpImage = image;
			return image;
		};

		/**
		 * 文字を描画する.
		 */
		pt.drawString = function(ctx, text, offsetx=0, offsety=0, isDraw=true) {
			ctx.translate(offsetx, offsety);
			ctx.font   = String(this.fontSize) + 'pt Times';
			let mesure = ctx.measureText( text );
			//let textW  =  mesure.width;
			// let textW  =  mesure.width;
			let textW  = mesure.actualBoundingBoxRight - mesure.actualBoundingBoxLeft;
			let textH  = mesure.actualBoundingBoxAscent + mesure.actualBoundingBoxDescent;
			let x      = 0;
			let y      = mesure.actualBoundingBoxAscent

			if (isDraw) {
				ctx.fillStyle = '#000';
				ctx.fillText(text, x, y);

				//ctx.strokeStyle = '#fff';
				//ctx.lineWidth = 1;
				// ctx.strokeText(text, x, y);

				// default に戻す.
				ctx.setTransform(1, 0, 0, 1, 0, 0); // 変形行列を単位行列に戻す
			}
			return [textW, textH];
		}

		/**
		 * 吹き出しの描画.
		 */
		pt.drawFukidaShi = function(ctx, info, offsetx=0, offsety=0, isDraw=true) {
			function _lerp(a, b, t) {
				return a + (b - a) * t;
			};

			const x0 = info.x0;
			const y0 = info.y0;
			const x1 = x0 + info.w;
			const y1 = y0 + info.h;

			let path = [];
			// 矩形.
			path.push( [x0, y0] );
			path.push( [x1, y0] );
			path.push( [x1, y1] );
			path.push( [x0, y1] );

			// 矩形に吹き出しの尖った部分を追加.
			if (this.pos === "left") {
				path.splice(4, 0,
							[x0,      _lerp(y1, y0, info.f0)],
							[x0 - fl, _lerp(y1, y0, info.f1)],
							[x0,      _lerp(y1, y0, info.f1)] );
			} else if (this.pos === "down") {
				path.splice(3, 0,
							[_lerp(x1, x0, info.f0), y1],
							[_lerp(x1, x0, info.f1), y1 + info.fl],
							[_lerp(x1, x0, info.f1), y1] );
			} else if (this.pos === "right") {
				path.splice(2, 0,
							[x1,      _lerp(y0, y1, info.f0)],
							[x1 + fl, _lerp(y0, y1, info.f1)],
							[x1,      _lerp(y0, y1, info.f1)] );

			} else if (this.pos === "up") {
				path.splice(1, 0,
							[_lerp(x0, x1, info.f0), y0],
							[_lerp(x0, x1, info.f1), y0 - info.fl],
							[_lerp(x0, x1, info.f1), y0] );
			}

			if (!isDraw) {
				//let bb = { minx:path[0][0], maxx:path[0][0], miny:path[0][1], maxy:path[0][1] };
				let bb = { minx:Infinity, maxx:-Infinity, miny:Infinity, maxy:-Infinity };
				for (let pos of path) {
					bb.minx = Math.min(bb.minx, pos[0]);
					bb.maxx = Math.max(bb.maxx, pos[0]);
					bb.miny = Math.min(bb.miny, pos[1]);
					bb.maxy = Math.max(bb.maxy, pos[1]);
				}
				return bb;
			}

			ctx.translate(offsetx, offsety);
			// ctx.rotate(10 * Math.PI / 180);

			ctx.beginPath();
			ctx.moveTo( path[0][0], path[0][1] );
			for (let i = 1; i < path.length; ++i) {
				ctx.lineTo( path[i][0], path[i][1] );
			}

			ctx.lineTo( path[0][0], path[0][1] );
			ctx.closePath();

			ctx.lineJoin    = "round";
			ctx.lineWidth   = 1;
			ctx.strokeStyle = "rgba(0, 0, 0, 1.0)";
			ctx.fillStyle   = "rgb(255, 255, 255)";
			
			ctx.fill();
			ctx.stroke();

			// default に戻す.
			ctx.setTransform(1, 0, 0, 1, 0, 0); // 変形行列を単位行列に戻す
			ctx.lineJoin    = "miter";
			ctx.lineWidth   = 1;

			return null;
		}

        return constructor;
    })();
})(CV);
// eof.
