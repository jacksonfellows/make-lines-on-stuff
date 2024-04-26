let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

function loadPicture(path) {
	let image = new Image();
	image.src = path;
	image.onload = _ => {
		canvas.width = image.width;
		canvas.height = image.height;
		ctx.drawImage(image, 0, 0);
	};
}

loadPicture('Picture1.png');

function getCoords(e) {
	let rect = canvas.getBoundingClientRect();
	return [e.clientX - rect.left, e.clientY - rect.top];
}

let WAITING    = 0;
let LINE_P1    = 1;
let LINE_P2    = 2;
let SCALE_X_P1 = 3;
let SCALE_X_P2 = 4;
let SCALE_Y_P1 = 5;
let SCALE_Y_P2 = 6;
let TRACING    = 7;

let prev_p;
let prev_input;

let state = WAITING;

let T = {
	x0: 0,
	y0: 0,
	xScale: 1,
	yScale: 1
};

function transform(p) {
	return [T.xScale * p[0] - T.x0, T.yScale * p[1] - T.y0];
}

function revSlopeIntercept(p1, p2) {
	let m = (p2[0] - p1[0]) / (p2[1] - p1[1]);
	let b = p1[0] - m*p1[1];
	return [m,b];
}

canvas.onclick = e => {
	let p = getCoords(e);
	switch (state) {
	case LINE_P1:
		prev_p = p;
		state = LINE_P2;
		break;
	case LINE_P2:
		ctx.beginPath();
		ctx.moveTo(prev_p[0], prev_p[1]);
		ctx.lineTo(p[0], p[1]);
		ctx.stroke();
		let [m,b] = revSlopeIntercept(transform(prev_p), transform(p));
		ctx.fillStyle = ctx.strokeStyle;
		ctx.fillText('x = ' + m.toFixed(3) + '*y + ' + b.toFixed(3), (p[0] - prev_p[0]) / 2 + prev_p[0], (p[1] - prev_p[1]) / 2 + prev_p[1]);
		state = WAITING;
		break;
	case SCALE_X_P1:
		prev_p = p;
		prev_input = Number(window.prompt('x:'));
		state = SCALE_X_P2;
		break;
	case SCALE_X_P2:
		let x1 = prev_input;
		let x2 = Number(window.prompt('x:'));
		T.xScale = (x2 - x1) / (p[0] - prev_p[0]);
		T.x0 = - x1 + prev_p[0] * T.xScale;
		state = WAITING;
		break;
	case SCALE_Y_P1:
		prev_p = p;
		prev_input = Number(window.prompt('y:'));
		state = SCALE_Y_P2;
		break;
	case SCALE_Y_P2:
		let y1 = prev_input;
		let y2 = Number(window.prompt('y:'));
		T.yScale = (y2 - y1) / (p[1] - prev_p[1]);
		T.y0 = - y1 + prev_p[1] * T.yScale;
		state = WAITING;
		break;
	}
};

let trace_output = '';

canvas.onmousemove = e => {
	let p = getCoords(e);
	let [x,y] = transform(p);
	document.getElementById('coords').innerText = x.toFixed(3) + ',' + y.toFixed(3);
	if (state == TRACING) {
		trace_output += x.toFixed(3) + ',' + y.toFixed(3) + '\n';
	}
};

document.onkeydown = e => {
	let k = e.key;
	switch (k) {
	case 'r': ctx.strokeStyle = 'red'; break;
	case 'g': ctx.strokeStyle = 'green'; break;
	case 'b': ctx.strokeStyle = 'blue'; break;
	case 'k': ctx.strokeStyle = 'black'; break;
	case 'w': ctx.strokeStyle = 'white'; break;
	default:
		switch (state) {
		case TRACING:
			switch (k) {
			case 't':
				console.log(trace_output);
				state = WAITING;
				break;
			}
		case WAITING:
			switch (k) {
			case 'l': state = LINE_P1; break;
			case 'x': state = SCALE_X_P1; break;
			case 'y': state = SCALE_Y_P1; break;
			case 't': state = TRACING; trace_output = ''; break;
			}
		}
		break;
	}
};
