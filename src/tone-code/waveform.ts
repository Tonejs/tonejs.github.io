/** Match the canvas's pixel size to its CSS size (resizing clears it, so only when it changes) */
function context2d(canvas: HTMLCanvasElement) {
	const ratio = devicePixelRatio;
	const width = Math.round(canvas.clientWidth * ratio);
	const height = Math.round(canvas.clientHeight * ratio);
	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
	}
	const context = canvas.getContext("2d")!;
	context.clearRect(0, 0, width, height);
	return { context, width, height, ratio };
}

/** Draw the min/max envelope of a block of live samples, spanning -1 to 1 */
export function drawWaveform(canvas: HTMLCanvasElement, values: Float32Array, color: string) {
	const { context, width, height, ratio } = context2d(canvas);
	context.fillStyle = color;
	const middle = height / 2;
	const scale = middle * 0.9;
	const samplesPerPixel = values.length / width;
	for (let x = 0; x < width; x++) {
		let low = 0;
		let high = 0;
		const start = Math.floor(x * samplesPerPixel);
		const end = Math.max(start + 1, Math.floor((x + 1) * samplesPerPixel));
		for (let i = start; i < end && i < values.length; i++) {
			low = Math.min(low, values[i]);
			high = Math.max(high, values[i]);
		}
		context.fillRect(x, middle - high * scale, 1, Math.max(ratio, (high - low) * scale));
	}
}

/** Evenly spaced round values (steps of 1, 2 or 5 × 10^n) covering min to max */
function ticks(min: number, max: number, count: number) {
	const rough = (max - min) / count;
	const magnitude = 10 ** Math.floor(Math.log10(rough));
	const fraction = rough / magnitude;
	const step = (fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10) * magnitude;
	const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
	const values: { value: number; label: string }[] = [];
	for (let value = Math.ceil(min / step) * step; value <= max + step * 1e-6; value += step) {
		// round away float error (and "-0") without trailing zeros
		values.push({ value, label: String(Number((Math.abs(value) < step / 2 ? 0 : value).toFixed(decimals))) });
	}
	return values;
}

export interface PlotColors {
	line: string;
	axis: string;
	text: string;
}

/**
 * Plot a rendered buffer against time, one row per channel. The y range fits the
 * signal with 5% headroom on either side, and the x axis is labeled in seconds.
 */
export function drawPlot(canvas: HTMLCanvasElement, channels: Float32Array[], sampleRate: number, colors: PlotColors) {
	const { context, width, height, ratio } = context2d(canvas);
	const fontSize = 10 * ratio;
	const tickLength = 4 * ratio;
	const inset = 8 * ratio;
	context.font = `${fontSize}px ui-monospace, monospace`;
	context.lineWidth = ratio;

	// the range always includes 0 so the zero line is drawn
	let min = 0;
	let max = 0;
	for (const data of channels) {
		for (const value of data) {
			if (value < min) min = value;
			if (value > max) max = value;
		}
	}
	const padding = (max - min) * 0.05 || Math.abs(max) || 1;
	min -= padding;
	max += padding;

	const duration = Math.max(...channels.map((data) => data.length)) / sampleRate || 1;
	const rows = channels.length;
	const yTicks = ticks(min, max, rows > 1 ? 3 : 4);
	const xTicks = ticks(0, duration, Math.max(2, Math.floor(width / (80 * ratio))));

	// leave room for the labels
	const left = inset + Math.max(...yTicks.map((tick) => context.measureText(tick.label).width)) + tickLength + 4 * ratio;
	const right = width - inset - context.measureText(xTicks.at(-1)!.label + "s").width / 2 - 2 * ratio;
	const top = inset;
	const bottom = height - inset - fontSize - tickLength - 4 * ratio;
	const rowHeight = (bottom - top) / rows;
	const toX = (seconds: number) => left + (seconds / duration) * (right - left);

	channels.forEach((data, row) => {
		const rowTop = top + row * rowHeight;
		const rowBottom = rowTop + rowHeight - (row < rows - 1 ? fontSize : 0);
		const toY = (value: number) => rowBottom - ((value - min) / (max - min)) * (rowBottom - rowTop);

		// y axis, ticks and labels
		context.strokeStyle = colors.axis;
		context.fillStyle = colors.text;
		context.textAlign = "right";
		context.textBaseline = "middle";
		context.beginPath();
		context.moveTo(left, rowTop);
		context.lineTo(left, rowBottom);
		for (const { value, label } of yTicks) {
			const y = Math.round(toY(value)) + 0.5;
			context.moveTo(left - tickLength, y);
			context.lineTo(left, y);
			context.fillText(label, left - tickLength - 2 * ratio, y);
		}
		const zero = Math.round(toY(0)) + 0.5;
		context.moveTo(left, zero);
		context.lineTo(right, zero);
		context.stroke();

		// the signal: every sample when zoomed in, otherwise each pixel column's min and max
		context.save();
		context.beginPath();
		context.rect(left, rowTop, right - left, rowBottom - rowTop);
		context.clip();
		context.strokeStyle = colors.line;
		context.lineWidth = 2 * ratio;
		context.lineJoin = "round";
		context.beginPath();
		const plotWidth = right - left;
		if (data.length <= plotWidth * 2) {
			data.forEach((value, i) => context.lineTo(toX(i / sampleRate), toY(value)));
		} else {
			const samplesPerPixel = data.length / plotWidth;
			for (let x = 0; x < plotWidth; x++) {
				let low = Infinity;
				let high = -Infinity;
				const end = Math.min(data.length, Math.floor((x + 1) * samplesPerPixel));
				for (let i = Math.floor(x * samplesPerPixel); i < end; i++) {
					low = Math.min(low, data[i]);
					high = Math.max(high, data[i]);
				}
				context.lineTo(left + x, toY(low));
				context.lineTo(left + x, toY(high));
			}
		}
		context.stroke();
		context.restore();
	});

	// time ticks and labels along the bottom (the zero line is the x axis)
	context.strokeStyle = colors.axis;
	context.fillStyle = colors.text;
	context.textAlign = "center";
	context.textBaseline = "top";
	context.beginPath();
	for (const { value, label } of xTicks) {
		const x = Math.round(toX(value)) + 0.5;
		context.moveTo(x, bottom);
		context.lineTo(x, bottom + tickLength);
		context.fillText(`${label}s`, x, bottom + tickLength + 2 * ratio);
	}
	context.stroke();
}
