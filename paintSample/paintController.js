/**
 * ペイントコントローラー.
 */
class paintController {
	constructor(canvas)
	{
		this._canvas  = canvas;
		this._context = canvas.getContext('2d');
		canvas.setAttribute('tabindex', 0); // focusしている時のみ、keyDown,up を有効に

		//this._context.fillStyle = 'rgba(255, 255, 0, 255)';
		//this._context.fillRect(0, 0, canvas.width, canvas.height);

		this._panel = new paintPanel();

		this._bindFunc = {};
		this._brushImage = null;

		this._isMouseDown = false;
		this._prevMousePos = [0, 0];
		this._isErase     = false;
	}

	init()
	{
		this.initBrush();
	
		this.initEvent(this._canvas, true); // 'keydown' イベントが来ない.
		// this.initEvent(window, true);
		this.update();
	}

	initBrush()
	{
		let canvas    = document.createElement('canvas');
		canvas.width  = 64;
		canvas.height = 64;
		let context   = canvas.getContext('2d'); // canvas.getContext('2d', {alpha: false});

		context.fillStyle = 'rgba(255, 255, 0, 0.5)';
		context.fillRect(0, 0, canvas.width, canvas.height);

		this._brushImage = canvas;

		const len = 64;
		let imageData = new ImageData(len, len)

		let data = imageData.data;
		for (let y = 0; y < len; ++y) {
			let p0 = y * len * 4;
			let y2 = (y * 2 / len - 1) ** 2;
			for (let x = 0; x < len; ++x) {
				let x2 = (x * 2 / len - 1) ** 2;
				let alpha = Math.round( (1 - Math.sqrt(y2 + x2)) * 255);;
				alpha = Math.max(0, alpha);

				data[p0 + 0] = 0;
				data[p0 + 1] = 0;
				data[p0 + 2] = 0;
				data[p0 + 3] = alpha;

				p0 += 4;
			}
		}

		context.putImageData(imageData, 0, 0);
		
	}

	update()
	{
		// console.log("update()");

		this.render();

		requestAnimationFrame(this.update.bind(this));
	}

	render()
	{
		this._context.fillStyle = "rgb(128, 128, 0)";
		this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

		this._panel.render(this._context);
	}

	setupEvent(elem,evName,evFunc,isActive)
	{
		// バインドされた関数を保持しておかないとremoveできない
		let bindFunc = this._bindFunc[evName];
		if (!bindFunc) {
			bindFunc = evFunc.bind(this);
			this._bindFunc[evName] = bindFunc;
		}
		
		let option = {passive: false};
		if (isActive)
		{
		    elem.addEventListener(evName, bindFunc,option);
		}else{
			elem.removeEventListener(evName,bindFunc,option);
		}
	}

	initEvent(elem,isActive)
	{
		this.setupEvent(elem,'touchstart',this.onTouchStart,isActive);
		this.setupEvent(elem,'touchmove',this.onTouchMove,isActive);
		this.setupEvent(elem,'touchend',this.onTouchEnd,isActive);
		this.setupEvent(elem,'touchcancel',this.onTouchCancel,isActive);
		this.setupEvent(elem,'keydown',this.onKeyDown,isActive);
		this.setupEvent(elem,'keyup',this.onKeyUp,isActive);
		this.setupEvent(elem,'mousedown',this.onMouseDown,isActive);
		this.setupEvent(elem,'mousemove',this.onMouseMove,isActive);
		this.setupEvent(elem,'mouseup',this.onMouseUp,isActive);
		this.setupEvent(elem,'mouseout',this.onMouseOut,isActive);
		this.setupEvent(elem,'onmousewheel',this.onMouseWheel,isActive);
		this.setupEvent(elem,'mousewheel',this.onMouseWheel,isActive);
		
//		this.setupEvent(elem,'dblclick',(e)=>{},isActive);

	    this.setupEvent(elem,'gesturestart', this.preventScroll, isActive);
	    this.setupEvent(elem,'gesturechange', this.preventScroll, isActive);
	    this.setupEvent(elem,'gestureend', this.preventScroll, isActive);
	    this.setupEvent(elem,'touchmove.noScroll', this.preventScroll, isActive);
	    this.setupEvent(elem,'touchmove', this.preventScroll, isActive);
	    this.setupEvent(elem,'dragstart', this.preventScroll, isActive);
	    this.setupEvent(elem,'drag', this.preventScroll, isActive);
	    this.setupEvent(elem,'dragend', this.preventScroll, isActive);
		
	    // コンテキストメニューを開かない
	    //this.setupEvent(elem,'contextmenu', this.preventScroll, isActive);
		//this.setupEvent(window,'message',this.onMessage,isActive);
	}

	onTouchStart(e)
	{
	}

	onTouchMove(e)
	{
	}

	onTouchEnd(e)
	{
	}

	onTouchCancel(e)
	{
	}

	onKeyDown( event )
	{
		if (event.code === "KeyC") {
			this._panel.clear();
		} else if (event.code === "KeyE") {
			this._isErase = !this._isErase;
		}
	}

	onKeyUp( event )
	{
	}

	onMouseDown(event)
	{
		this._isMouseDown = true;
		//this._context.drawImage(this._brushImage, event.clientX, event.clientY);
		//this._context.globalCompositeOperation = 'destination-out'; // 消しゴム.
		//this._context.globalCompositeOperation = 'source-over'; // default.
		this._panel.drawImageCenter(this._brushImage, event.offsetX, event.offsetY, 32, 32, this._isErase);
		this._prevMousePos = [event.offsetX, event.offsetY];
	}

	onMouseMove(event)
	{
		if (!this._isMouseDown) {
			return;
		}

		// マウス移動量を考慮して描画.
		let rect = this._panel.convRect(0, 0, 1, 1);
		let scale = 1 / (rect[2] * rect[3]);
		if (scale * 4**2 < (this._prevMousePos[0] - event.offsetX) ** 2 + (this._prevMousePos[1] - event.offsetY) ** 2) {
			this._panel.drawImageCenter(this._brushImage, event.offsetX, event.offsetY, 32, 32, this._isErase);
			this._prevMousePos = [event.offsetX, event.offsetY];
		}
	}

	onMouseUp(event)
	{
		this._isMouseDown = false;
	}

	onMouseOut(event)
	{
		this._isMouseDown = false;
	}
	
	onMouseWheel(event)
	{
		const w = this._panel.getWidth();
		const h = this._panel.getHeight();
		const s = 1.05;
		
		if (0 < event.wheelDelta) {
			this._panel.setSize(w * s, h * s);
		} else {
			this._panel.setSize(w / s, h / s);
		}
	}

	// デフォルトの動作
	preventScroll(e)
	{
	    //e.preventDefault();
		//this.InputPalse();
	}
}

