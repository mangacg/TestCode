class Mathf 
{
	static get RadToDeg()
	{
		return 180 / Math.PI;
	}
	static get DegToRad()
	{
		return Math.PI / 180;
	}

	static RadianToDegree( radians )
	{
		return radians * 180 / Math.PI;
	}
	static DegreeToRadian( degrees )
	{
		return degrees * Math.PI / 180;
	}

	// GUID生成
	static CreateGUID()
	{
		let id = "";
		for(let i=0;i<32;++i)
		{
			let v = Math.floor(Math.random()*16);
			if ((i==8)||(i==12)||(i==16)||(i==20)) id+='-';
			id += ((i==12) ? 4:((i==16) ? (v&3|8):v)).toString(16);
		}
		return id;
	}
	
	static Clamp(v,min,max){
		if (v < min)
		{
			return min;
		}else if (v > max)
		{
			return max;
		}
		return v;
	}
	static Clamp01(v){
		if (v < 0)
		{
			return 0;
		}else if (v > 1)
		{
			return 1;
		}
		return v;
	}
	static Repeat(a,len)
	{
		return a - (Math.floor(a/len) * len);
	}
	static Lerp(a,b,r)
	{
		r = Mathf.Clamp01(r);
		return a * (1-r) + b * r;
	}
	static DeltaAngle(a,b)
	{
		let dif = Mathf.Repeat(b-a,Math.PI*2);
		if (dif > Math.PI)
		{
			dif -= Math.PI*2;
		}
		return dif;
	}
	static LerpAngle(a,b,r)
	{
		r = Mathf.Clamp01(r);
		let delta = Mathf.DeltaAngle(a,b);
		return a + delta * r;
	}
	static LerpAngleSign(a,b,r,sign)
	{
		r = Mathf.Clamp01(r);
		if (sign>0)
		{
			if (b - a < 0)
			{
				b = b + (Math.floor((a-b)/(Math.PI*2))+1)*Math.PI*2;
			}
		}else{
			if (b - a > 0)
			{
				b = b - (Math.floor((b-a)/(Math.PI*2))+1)*Math.PI*2;
			}
		}
		let delta = b-a;
		return a + delta * r;
	}
	static MoveTowards(a,b,r)
	{
		if (Math.abs(a-b) < r)
		{
			return b;
		}
		if (a < b)
		{
			return a + r;
		}else{
			return a - r;
		}
	}
	
	// ２つの角度が真っすぐかどうか判定
	static IsStraitAngle(a,b)
	{
		let eps = 0.0001;
		if (Math.abs(Mathf.DeltaAngle(a,b)) < eps)
		{
			return true;
		}
		return false;
	}

	static Sign(v)
	{
		if (v>0) return 1;
		if (v<0) return -1;
		return 0;
	}
	
    static ZeroHermite(v)
    {
        v = Math.abs(v);
        if (v > 1.0)
        {
            return 0.0;
        }
        return (1.0 - 3.0 * v * v + 2.0 * v * v * v);
    }
	
	static AngleUnder180(v)
	{
		const full = 360;
		const half = 180;
		v = (v<0)?((v-half)%full)+half:((v+half)%full)-half;
		return v;
	}
	
	static StepNumber(v,step)
	{
		return Math.round(v / step) * step;
	}

	// Vector2 functions-----------------------------------
    // Vector2を回転させる
    static RotateVec2(v, deg)
    {
        let fSin = Math.sin(-deg * Mathf.DegToRad);
        let fCos = Math.cos(-deg * Mathf.DegToRad);

    	let r = v.clone();
        r.x = (fCos * v.x) - (fSin * v.y);
        r.y = (fSin * v.x) + (fCos * v.y);
        return r;
    }
    // Vector2同士の角度
    static SignedAngle(a,b)
    {
    	let rad = Math.acos(a.dot(b));
    	let dir = (a.x*b.y - a.y*b.x);// cross
    	if (dir<0)
    	{
    		return rad * Mathf.RadToDeg;
    	}else{
    		return -rad * Mathf.RadToDeg;
    	}
    }
    
    // Vector3 functions-----------------------------------
    static DistanceLineAndPoint(point,lineA,lineB)
    {
    	let ret = {};
    	let ratio = 0;
    	let dir = lineB.clone();
    	dir.sub(lineA);
    	let len = dir.length();
        if (len > 0.000001)
        {
            dir.divideScalar(len);
            ratio = point.clone().sub(lineA).divideScalar(len).dot(dir);
            if (ratio < 0)
            {
            	ret.ratio = 0;
            	ret.dist = point.clone().sub(lineA).length();
                return ret;
            }
            else if (ratio > 1)
            {
            	ret.ratio = 1;
            	ret.dist = point.distanceTo(lineB);
                return ret;
            }
        }else
        {
        	ret.ratio = 0;
        	ret.dist = point.distanceTo(lineA);
            return ret;
        }

    	ret.ratio = ratio;
    	ret.dist = lineA.clone().lerp(lineB,ratio).distanceTo(point);
        return ret;
    }

	// Matrix4 functions-----------------------------------
	static LerpMatrix(d,m0,m1,lerp)
	{
		for(let i=0;i<16;++i)
		{
			d.elements[i] = Mathf.Lerp(m0.elements[i],m1.elements[i],lerp);
		}
	}

	// 最大解像度を踏まえて解像度の変換
	// width : オリジナル画像の幅
	// height : オリジナル画像の高さ
	// maxRes : 最大解像度
	static ConvertRes(width,height,maxRes = 1024)
	{
		let longRes = Math.max(width,height);	// 長辺
		let shortRes = Math.min(width,height);	// 短辺
		// 最大解像度より大きいときは、解像度を減らす
		if (maxRes < longRes)
		{
			shortRes = (maxRes*shortRes)/longRes;	// アスペクト比×最大解像度
			shortRes = Math.round(shortRes);	// 四捨五入
			shortRes = Math.max(1,shortRes);	// １未満にはしない
			longRes = maxRes;	// 長いほうは最大値にする
		}
		
		// 縦横、長いほうに長辺の解像度、短いほうに短辺の解像度を与える
		if (width>height)
		{
			return {'width':longRes,'height':shortRes};
		}else{
			return {'width':shortRes,'height':longRes};
		}
	}
	
	// ２のべき乗か？
	static IsPowerOfTwo(v)
	{
	    return ((Math.log(v)/Math.log(2)) % 1) === 0;
	}
};

var CV = CV || {};

(function(namespace) {
	'use strict';

	class Vector2 {
		constructor(x=0, y=0) {
 			this.x = x;
 			this.y = y;
		}

		set(x, y) {
 			this.x = x;
 			this.y = y;
			return this;
		}

		clone() {
			return new this.constructor(this.x, this.y);
		}

		copy( v ) {
			this.x = v.x;
			this.y = v.y;
			return this;
		}

		equals(v) {
			return (v.x === this.x && v.y === this.y);
		}

		dot(v) {
			return this.x * v.x + this.y * v.y;
		}

		length() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		}

		normalize() {
			let length = this.length() || 1;
			this.x /= length;
			this.y /= length;
			return this;
		}

		add( v ) {

			this.x += v.x;
			this.y += v.y;

			return this;

		}

		min( v ) {

			this.x = Math.min( this.x, v.x );
			this.y = Math.min( this.y, v.y );

			return this;
		}

		max( v ) {
			this.x = Math.max( this.x, v.x );
			this.y = Math.max( this.y, v.y );

			return this;
		}

		addVectors( a, b ) {

			this.x = a.x + b.x;
			this.y = a.y + b.y;

			return this;

		}

		subVectors( a, b ) {

			this.x = a.x - b.x;
			this.y = a.y - b.y;

			return this;

		}
	}

	namespace.Vector2 = Vector2;

	const _vector = /*@__PURE__*/ new Vector2();

	class Box2 {

		constructor( min = new Vector2( + Infinity, + Infinity ), max = new Vector2( - Infinity, - Infinity ) ) {

			this.isBox2 = true;

			this.min = min;
			this.max = max;

		}

		set( min, max ) {

			this.min.copy( min );
			this.max.copy( max );

			return this;

		}

		setFromPoints( points ) {

			this.makeEmpty();

			for ( let i = 0, il = points.length; i < il; i ++ ) {

				this.expandByPoint( points[ i ] );

			}

			return this;

		}

		setFromCenterAndSize( center, size ) {

			const halfSize = _vector.copy( size ).multiplyScalar( 0.5 );
			this.min.copy( center ).sub( halfSize );
			this.max.copy( center ).add( halfSize );

			return this;

		}

		clone() {

			return new this.constructor().copy( this );

		}

		copy( box ) {

			this.min.copy( box.min );
			this.max.copy( box.max );

			return this;

		}

		makeEmpty() {

			this.min.x = this.min.y = + Infinity;
			this.max.x = this.max.y = - Infinity;

			return this;

		}

		isEmpty() {

			// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

			return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y );

		}

		getCenter( target ) {

			return this.isEmpty() ? target.set( 0, 0 ) : target.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

		}

		getSize( target ) {

			return this.isEmpty() ? target.set( 0, 0 ) : target.subVectors( this.max, this.min );

		}

		expandByPoint( point ) {

			this.min.min( point );
			this.max.max( point );

			return this;

		}

		expandByPoint2( x, y ) {

			this.min.x = Math.min( this.min.x, x );
			this.min.y = Math.min( this.min.y, y );
			this.max.x = Math.max( this.max.x, x );
			this.max.y = Math.max( this.max.y, y );

			return this;
		}

		expandByVector( vector ) {

			this.min.sub( vector );
			this.max.add( vector );

			return this;

		}

		expandByScalar( scalar ) {

			this.min.addScalar( - scalar );
			this.max.addScalar( scalar );

			return this;

		}

		containsPoint( point ) {

			return point.x < this.min.x || point.x > this.max.x ||
				point.y < this.min.y || point.y > this.max.y ? false : true;

		}

		containsBox( box ) {

			return this.min.x <= box.min.x && box.max.x <= this.max.x &&
				this.min.y <= box.min.y && box.max.y <= this.max.y;

		}

		getParameter( point, target ) {

			// This can potentially have a divide by zero if the box
			// has a size dimension of 0.

			return target.set(
				( point.x - this.min.x ) / ( this.max.x - this.min.x ),
				( point.y - this.min.y ) / ( this.max.y - this.min.y )
			);

		}

		intersectsBox( box ) {

			// using 4 splitting planes to rule out intersections

			return box.max.x < this.min.x || box.min.x > this.max.x ||
				box.max.y < this.min.y || box.min.y > this.max.y ? false : true;

		}

		clampPoint( point, target ) {

			return target.copy( point ).clamp( this.min, this.max );

		}

		distanceToPoint( point ) {

			return this.clampPoint( point, _vector ).distanceTo( point );

		}

		intersect( box ) {

			this.min.max( box.min );
			this.max.min( box.max );

			if ( this.isEmpty() ) this.makeEmpty();

			return this;

		}

		union( box ) {

			this.min.min( box.min );
			this.max.max( box.max );

			return this;

		}

		translate( offset ) {

			this.min.add( offset );
			this.max.add( offset );

			return this;

		}

		equals( box ) {

			return box.min.equals( this.min ) && box.max.equals( this.max );

		}

	}

	namespace.Box2 = Box2;


})(CV);
// eof.
