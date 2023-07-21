/**
 * ペイントパネル.
 */
class paintPanel {
	constructor()
	{
		this._baseCanvas = document.createElement('canvas');
		this._drawCanvas = document.createElement('canvas');

		this.setImageSize(240, 360)

		// 描画位置. 親canvasの相対位置.
		this.setPosition(100, 150);
		this.setSize(this._imageWidth * 2,
					 this._imageHeight * 2);

		// テスト.
		let context  = this._baseCanvas.getContext('2d');
		context.fillStyle = 'rgba(255, 255, 255, 255)';
		context.fillRect(0, 0, this._baseCanvas.width, this._baseCanvas.height);

		this.clear();
	}

	/**
	 * パネルの位置を指定する.
	 */
	setPosition(x, y)
	{
		this._x = x;
		this._y = y;
	}

	/**
	 * パネルの大きさ指定する.
	 */
	setSize(w, h)
	{
		this._width  = w;
		this._height = h;
	}

	getX = function() {
		return this._x;
	}

	getY = function() {
		return this._y;
	}

	getWidth = function() {
		return this._width;
	}

	getHeight = function() {
		return this._height;
	}

	/**
	 * イメージの大きさ指定する.
	 */
	setImageSize(w, h)
	{
		this._imageWidth  = w;
		this._imageHeight = h;

		this._baseCanvas.width  = w;
		this._baseCanvas.height = h;

		this._drawCanvas.width  = w;
		this._drawCanvas.height = h;
	}

	/**
	 * コンテキストに描画する.
	 */
	render(context)
	{
		context.drawImage(this._baseCanvas, this._x, this._y, this._width, this._height);
		context.drawImage(this._drawCanvas, this._x, this._y, this._width, this._height);
	}

	/**
	 * Imageを描画する. 座標は親座標.
	 */
	drawImage(image, x, y, w, h)
	{
		let rect = this.convRect(x, y, w, h);
		let context  = this._drawCanvas.getContext('2d');
		context.drawImage(image, rect[0], rect[1], rect[2], rect[3]);
	}

	/**
	 * Imageを描画する. 座標は親座標.
	 */
	drawImageCenter(image, cx, cy, w, h, isErase)
	{
		let rect = this.convRect(cx, cy, w, h);
		let context  = this._drawCanvas.getContext('2d');

		context.globalCompositeOperation = isErase ? 'destination-out' : 'source-over'; // 消しゴム?
		context.drawImage(image, rect[0] - w/2, rect[1] - h/2, w, h); // w, hはスケールしない.

		context.globalCompositeOperation = 'source-over'; // defaultに戻す.
	}

	/**
	 * 描画をクリアする.
	 */
	clear()
	{
		let context  = this._drawCanvas.getContext('2d');
		//context.fillStyle = 'rgba(0, 0,0, 0)';
		//context.fillRect(0, 0, this._drawCanvas.width, this._drawCanvas.height);
		context.clearRect(0, 0, this._drawCanvas.width, this._drawCanvas.height);
	}

	
	/**
	 * 親座標を自身の座標に変換する.
	 */
	convRect(x, y, w, h)
	{
		const sx = this._baseCanvas.width  / this._width;
		const sy = this._baseCanvas.height / this._height;
		let x1 = sx * (x - this._x);
		let y1 = sy * (y - this._y);
		let w1 = sx * w;
		let h1 = sy * h;
		return [x1, y1, w1, h1];
	}

}

