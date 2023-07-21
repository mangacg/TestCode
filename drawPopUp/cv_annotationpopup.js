var CV = CV || {};

(function(namespace) {
	'use strict';

	/**
	 * 注釈ポップアップ画像管理.
	 */
    namespace.AnnotationPopUpImage = (function() {
        var constructor = function(param) {

			this.reset();
		}

        var pt = constructor.prototype;

		/**
		 * 定数.
		 */
		const _kMarginStr = 4; // 文字の外の余白.
		const _kMargin    = 4; // 吹き出しの外の余白.

		/**
		 * リセット.
		 */
		pt.reset = function() {
			this.popUpImage = null;
			this.fontSize   = 16;
			this.text       = [ '日本語のポップアップ', 'テスト', '三行目です' ];
			this.pos        = "up"; // ポップ表示位置(up,down.left,right).
			this.direction  = 'horizontal'; // 縦書き横書き(vertical,horizontal).
			this.bubbleDrawInfo = null;  // 吹き出し描画用の情報.
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
			const text     = this.text; // 1行目のみ. todo:
			let bbSize     = new namespace.Vector2();

			// 文字列の描画サイズを取得.

			//let textBB = this.drawText(ctx, text, 0, 0, false);
			let textBB = this.drawTextArray(ctx, text, 0, 0, false);
			textBB.getSize( bbSize );

			// 吹き出しの情報を設定.

			let info = {};
			info.w  = bbSize.x; // テキストの領域.
			info.h  = bbSize.y;
			info.fl = 50;  // 吹き出しの長さ.
			info.f0 = 0.4; // 吹き出しの位置さ.
			info.f1 = 0.5;
			info.pos = this.pos;

			// 吹き出しパスとbboxを更新.

			this.makeBubblePath(info);

			// 画像サイズ変更.
			canvas.width  = this.bubbleDrawInfo.imageSize.w;
			canvas.height = this.bubbleDrawInfo.imageSize.h;
			ctx.fillStyle = "rgb(255,  128, 0)";
			ctx.fillRect(0, 0, canvas.width, canvas.height); // todo test.
			// ctx.clearRect(0, 0, width, height);

			// 吹き出しを描画.
			const offsetx = this.bubbleDrawInfo.pathPos.x;
			const offsety = this.bubbleDrawInfo.pathPos.y;
			this.drawBubble(ctx, offsetx, offsety);

			// 吹き出しの中に文字を描画.

			this.drawTextArray(ctx, text, this.bubbleDrawInfo.textArea.x, this.bubbleDrawInfo.textArea.y);

			// Image生成.
			let image = new Image();
			image.src = canvas.toDataURL();
			image.width  = canvas.width;
			image.height = canvas.height;
			image.onload = ()=>{
				// console.log("test Image load done. : " + text0);
			};
			this.popUpImage = image;
			return image;
		};

		/**
		 * 文字列を描画する.
		 * @parm {context} ctx 2d context.
		 * @parm {string} text 文字列.
		 * @parm {number} offsetx 文字列の左上の座標 X.
		 * @parm {number} offsety 文字列の左上の座標 Y.
		 * @parm {Array} text stringの配列.
		 * @parm {boolean} isDraw 描画を行うか?
		 */
		pt.drawTextArray = function(ctx, text, offsetx=0, offsety=0, isDraw=true) {
			let bbOffset = new namespace.Vector2();
			let bbText   = new namespace.Box2();
			let y = 0; // 表示位置Y;

			for (let t of text) {
				let bb = this.drawText(ctx, t, offsetx, offsety + y, isDraw);

				y += (bb.max.y - bb.min.y) + _kMarginStr;
				bb.translate(new namespace.Vector2(0, y));
				bbText.union(bb);
			}
			return bbText;
		}

		/**
		 * 文字列を描画する.
		 * @parm {context} ctx 2d context.
		 * @parm {string} text 文字列.
		 * @parm {number} offsetx 文字列の左上の座標 X.
		 * @parm {number} offsety 文字列の左上の座標 Y.
		 * @parm {boolean} isDraw 描画を行うか?
		 * @return {Box2} バウンディングボックス. offsetの影響は受けない.
		 */
		pt.drawText = function(ctx, text, offsetx=0, offsety=0, isDraw=true) {
			ctx.font   = String(this.fontSize) + 'pt Times';
			let mesure = ctx.measureText( text );
			let bb = new namespace.Box2();
			bb.expandByPoint2( mesure.actualBoundingBoxLeft,  -mesure.actualBoundingBoxAscent);
			bb.expandByPoint2( mesure.actualBoundingBoxRight,  mesure.actualBoundingBoxDescent);
			let x      = 0; // -bb.min.x;
			let y      = -bb.min.y;

			if (isDraw) {
				ctx.translate(offsetx, offsety);
				
				ctx.fillStyle = '#000';
				ctx.fillText(text, x, y);

				//ctx.strokeStyle = '#fff';
				//ctx.lineWidth = 1;
				// ctx.strokeText(text, x, y);

				// default に戻す.
				ctx.setTransform(1, 0, 0, 1, 0, 0); // 変形行列を単位行列に戻す
			}
			//return [textW, textH];
			return bb;
		}

		/**
		 * 吹き出しのパス(頂点リスト)を生成する.
		 */
		pt.makeBubblePath = function(info) {
			function _lerp(a, b, t) {
				return a + (b - a) * t;
			};

			const mgn    = _kMargin;
			const mgnS   = _kMarginStr;
			
			const x0 = 0;
			const y0 = 0;
			const x1 = x0 + info.w + mgnS * 2;
			const y1 = y0 + info.h + mgnS * 2;
			const pos = info.pos;

			let path = [];
			// 矩形.
			path.push( [x0, y0] );
			path.push( [x1, y0] );
			path.push( [x1, y1] );
			path.push( [x0, y1] );

			let origin = [0, 0];

			// 矩形に吹き出しの尖った部分を追加.
			if (pos === "left") {
				path.splice(4, 0,
							[x0,           _lerp(y1, y0, info.f0)],
							[x0 - info.fl, _lerp(y1, y0, info.f1)],
							[x0,           _lerp(y1, y0, info.f1)] );
				origin = path[5];
			} else if (pos === "down") {
				path.splice(3, 0,
							[_lerp(x1, x0, info.f0), y1],
							[_lerp(x1, x0, info.f1), y1 + info.fl],
							[_lerp(x1, x0, info.f1), y1] );
				origin = path[4];
			} else if (pos === "right") {
				path.splice(2, 0,
							[x1,      _lerp(y0, y1, info.f0)],
							[x1 + fl, _lerp(y0, y1, info.f1)],
							[x1,      _lerp(y0, y1, info.f1)] );
				origin = path[3];
			} else if (pos === "up") {
				path.splice(1, 0,
							[_lerp(x0, x1, info.f0), y0],
							[_lerp(x0, x1, info.f1), y0 - info.fl],
							[_lerp(x0, x1, info.f1), y0] );
				origin = path[4];
			}

			// バウンディングボックスを取得.
			let bb = new namespace.Box2();
			for (let pos of path) {
				bb.expandByPoint2( pos[0], pos[1] );
			}

			const bbRect = {x: bb.min.x, y:bb.min.y, w:bb.max.x-bb.min.x, h:bb.max.y-bb.min.y };
			
			let pathInfo = {};
			pathInfo.drawInfo   = info;                        // 描画用のための情報.
			
			pathInfo.path       = path;                        // path
			pathInfo.pathBB     = bbRect;                      // path座標でのpathのBB.
			pathInfo.pathOrigin = {x:origin[0], y:origin[1]};   // path座標でのorigin.

			pathInfo.imageSize  = {w:bbRect.w + mgn*2, h:bbRect.h + mgn*2};       // パスを描画するImageのサイズ.
			pathInfo.pathPos    = {x:-bbRect.x + mgn, y:-bbRect.y + mgn};         // image座標でのpathの位置.
			pathInfo.origin     = {x:pathInfo.pathOrigin.x + pathInfo.pathPos.x,  // image座標 での pathOrigin.
								   y:pathInfo.pathOrigin.y + pathInfo.pathPos.y};
			pathInfo.textArea   = {x:pathInfo.pathPos.x + mgnS,                   // image 座標 での text area.
								   y:pathInfo.pathPos.y + mgnS,
								   w:info.w,
								   h:info.h}

			this.bubbleDrawInfo = pathInfo;
			/*
			  +--------------- image ------------------+
			  |                                        |
			  |   +------------ path --------------+   |
			  |   |                                |   |
			  |   |   +------------------------+   |   |
			  |   |   |  text area             |   |   |
			  |   |   |                        |   |   |
			  |   |   |                        |   |   |
			  |   |   |                        |   |   |
			  |   |   +------------------------+   |   |
			  |   |                                |   |
			  |   +--------------+   +-------------+   |
			  |                  |  /                  |
			  |                  | /                   |
			  |                  |/                    |
			  |                  + origin              |
			  |                                        |
			  +----------------------------------------+
			*/
		}

		/**
		 * 吹き出しの描画.
		 */
		pt.drawBubble = function(ctx, offsetx=0, offsety=0) {
			const path = this.bubbleDrawInfo.path;

			ctx.translate(offsetx, offsety);

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
