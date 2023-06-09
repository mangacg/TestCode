
let drawPopUpImage = function(canvas, bgColor, text0, text1, viewmode=false) {

	let   ctx      = canvas.getContext('2d');	
	const fontSize = 16;
	const text     = '日本語のポップアップ';

	let strSize = drawString(ctx, text, fontSize, 0, 0, false); // 文字列の描画サイズを取得.

	const x0 = 0;
	const y0 = 0;
	const w  = strSize[0]; // 300;
	const h  = strSize[1]; // 100;
	const x1 = x0 + w;
	const y1 = y0 + h;
	const fl = 50;// 吹き出しの長さ.
	const f0 = 0.4; // 吹き出しの位置さ.
	const f1 = 0.5;
	// const dir = "down";
	const dir = "up";
	const mgn = 4; // 文字まわりのマージン
	const mgn2 = mgn * 2; // マージン * 2

	// 吹き出しのbboxを取得.
	let bb = drawFukidaShi(ctx, x0, y0, w + mgn2, h + mgn2, fl, f0, f1, dir, 0, 0, false);

	canvas.width  = bb.maxx - bb.minx + mgn2;
	canvas.height = bb.maxy - bb.miny + mgn2;
	ctx           = canvas.getContext('2d');

	// クリア
    ctx.fillStyle = "rgb(255,  128, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.clearRect(0, 0, width, height);

	const offsetx = -bb.minx + mgn; // 吹き出しまわりのマージン.
	const offsety = -bb.miny + mgn;

	drawFukidaShi(ctx, x0, y0, w + mgn2, h + mgn2, fl, f0, f1, dir, offsetx, offsety);

	drawString(ctx, text, fontSize, offsetx + mgn, offsety + mgn);


	// Image生成.
	let image = new Image();
	image.src = canvas.toDataURL();
	image.onload = ()=>{
		// console.log("test Image load done. : " + text0);
	};
	return image;
}

/**
 * 吹き出しの描画.
 */
let drawFukidaShi = function(ctx, x0, y0, w, h, fl, f0, f1, dir, offsetx=0, offsety=0, isDraw=true) {
	function _lerp(a, b, t) {
		return a + (b - a) * t;
	};

	const x1 = x0 + w;
	const y1 = y0 + h;

	let path = [];
	// 矩形.
	path.push( [x0, y0] );
	path.push( [x1, y0] );
	path.push( [x1, y1] );
	path.push( [x0, y1] );

	// 矩形に吹き出しの尖った部分を追加.
	if (dir === "left") {
		path.splice(4, 0,
					[x0,      _lerp(y1, y0, f0)],
					[x0 - fl, _lerp(y1, y0, f1)],
					[x0,      _lerp(y1, y0, f1)] );
	} else if (dir === "down") {
		path.splice(3, 0,
					[_lerp(x1, x0, f0), y1],
					[_lerp(x1, x0, f1), y1 + fl],
					[_lerp(x1, x0, f1), y1] );
	} else if (dir === "right") {
		path.splice(2, 0,
					[x1,      _lerp(y0, y1, f0)],
					[x1 + fl, _lerp(y0, y1, f1)],
					[x1,      _lerp(y0, y1, f1)] );

	} else if (dir === "up") {
		path.splice(1, 0,
					[_lerp(x0, x1, f0), y0],
					[_lerp(x0, x1, f1), y0 - fl],
					[_lerp(x0, x1, f1), y0] );
	}

	if (!isDraw) {
		let bb = { minx:path[0][0], maxx:path[0][0], miny:path[0][1], maxy:path[0][1] };
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

/**
 * 文字の描画.
 */
let drawString = function(ctx, text, fontsize, offsetx=0, offsety=0, isDraw=true) {
	ctx.translate(offsetx, offsety);
	
	ctx.font   = String(fontsize) + 'pt Times';
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

let drawFontImage = function(canvas, bgColor, text0, text1, viewmode=false) {
	const width  = canvas.width;
	const height = canvas.height;
	const ctx    = canvas.getContext('2d');

	// クリア
    ctx.fillStyle = bgColor; // "rgb(255,  128, 128)";
    ctx.fillRect(0, 0, width, height);

	// 外枠描画.
	ctx.strokeStyle = '#ffff';
	ctx.lineWidth   = 2;
	if (viewmode) {
		ctx.strokeStyle = "rgb(128, 255, 255)"
		ctx.lineWidth   = 64;
	}
    ctx.strokeRect(0, 0, width, height);

	// 十字描画.
	ctx.strokeStyle = '#fff4';
	ctx.lineWidth   = 2;
	ctx.beginPath();
	ctx.moveTo(width / 2, 0);
	ctx.lineTo(width / 2, height);
	ctx.moveTo(0,     height / 2);
	ctx.lineTo(width, height / 2);
	ctx.stroke();

	// 文字0描画.
	ctx.font   = String(width * 0.5) + 'pt Times'; // '123pt Times';
	if (viewmode) {
		ctx.font   = String(width * 0.17) + 'pt Times'; // '123pt Times';
	}
    let mesure = ctx.measureText( text0 );
    let textW  =  mesure.width;
    let textH  =  mesure.actualBoundingBoxAscent + mesure.actualBoundingBoxDescent;

    let x    = (width  - textW) * 0.5;
    let y    = (height + textH) * 0.5;

    ctx.fillStyle = '#fff';
    ctx.fillText(text0, x, y);

	/*
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeText(text0, x, y);
	*/

	// 文字1描画.
	if (text1) {
		ctx.font   = String(width * 0.07) + 'pt Times';
		mesure = ctx.measureText( text1 );
		textW  =  mesure.width;
		textH  =  mesure.actualBoundingBoxAscent + mesure.actualBoundingBoxDescent;
		x      = (width  - textW) * 0.5;
		y      = (height + textH) * 0.5 - height * 0.3;

		ctx.fillStyle = '#fff';
		ctx.fillText(text1, x, y);
		/*
		  ctx.strokeStyle = '#000';
		  ctx.lineWidth = 1;
		  ctx.strokeText(text1, x, y);
		*/
	}

	// Image生成.
	let image = new Image();
	image.src = canvas.toDataURL();
	image.onload = ()=>{
		// console.log("test Image load done. : " + text0);
	};
	return image;
}


