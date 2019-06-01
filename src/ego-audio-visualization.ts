declare const Smooth: any;

export default class EgoAudioVisualization {

	//	Getter/Setter of HTML Canvas element
	public get canvas(): HTMLCanvasElement {
		return this._canvas;
	}

	public set canvas(canvas: HTMLCanvasElement) {
		this._canvas = canvas;

		//	Check context
		if (!this.canvas.getContext('2d')) {
			throw new Error(`Can't get canvas context.`);
		}

		this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
	}

	//	Canvas context
	public context: CanvasRenderingContext2D;

	//	Audio buffer
	public audioBuffer: AudioBuffer;

	//	HTML Canvas element
	private _canvas: HTMLCanvasElement;

	/**
	 * Draw rough audio curve
	 */
	public drawCurve(): void {
		const millStep = 100;
		const millLen = this.audioBuffer.length / this.audioBuffer.sampleRate * 1000 / millStep;
		const millLenPerStep = this.audioBuffer.sampleRate / 1000 * millStep;
		const channelInfo: any = {};
		const audioGraph: any[] = [];
		const channelLen = this.audioBuffer.numberOfChannels;
		const step = this.audioBuffer.length / millLen;

		this.cW(millLen * 2);

		for (let i = 0; i < this.audioBuffer.getChannelData(0).length; i += step) {
			let average = null;

			for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
				if (average === null) {
					average = this.audioBuffer.getChannelData(channel)[i];

					continue;
				}

				average = (average + this.audioBuffer.getChannelData(channel)[i]) / 2;
			}

			if (average === null) {
				continue;
			}

			audioGraph.push([
				//	X
				this.cW() / millLen * audioGraph.length,
				//	Y
				(average + 1) * (this.cH() / 2)
			]);
		}

		this.context.strokeStyle = '#ff0000';
		this.context.beginPath();

		audioGraph.forEach((item, i) => {
			this.smoothCurve(i, audioGraph);
		});

		this.context.stroke();

		console.log('`drawCurve` draw done.');
	}

	/**
	 * Draw rough audio like columns
	 */
	public drawColumns(colWidth: number = 3, quality: number = .05): void {
		const colLen = this.cW() / colWidth;
		const samplesPerCol = this.audioBuffer.length / colLen;
		const step = Math.max(1, samplesPerCol * quality);
		const numberOfChannels = this.audioBuffer.numberOfChannels;
		let colPos = 0;
		let prev = null;

		console.log(colLen);

		for (let i = 0; i < this.audioBuffer.getChannelData(0).length; i += step) {
			let average = null;

			for (let channel = 0; channel < numberOfChannels; channel++) {
				if (average === null) {
					average = this.audioBuffer.getChannelData(channel)[Math.floor(i)];

					continue;
				}

				average = (average + this.audioBuffer.getChannelData(channel)[Math.floor(i)]) / 2;
			}

			if (average === null) {
				continue;
			}

			if (i / samplesPerCol - 1 > colPos) {
				if (prev) {
					average = (average + prev) /2;
				}

				const y = this.cH() - (average + 1) * (this.cH() / 2);

				//	Draw column
				this.context.fillStyle = '#ffffff';

				this.context.fillRect(
					colPos * colWidth,
					y,
					colWidth,
					this.cH() - y
				);

				//	Draw column delimiter
				this.context.fillStyle = '#BFC0C6';
				const delimiterWidth = 1;

				this.context.fillRect(
					colPos * colWidth + colWidth - delimiterWidth / 2,
					y,
					delimiterWidth,
					this.cH() - y
				);

				console.log(
					colPos * colWidth,
					y,
					colWidth,
					this.cH() - y,
					this.cH(),
					average
				);

				//console.log(colPos);

				colPos++;
				prev = average;
			}
		}

		console.log('`drawColumns` draw done.');
	}

	/**
	 * Draw smooth curve
	 *
	 * @param i - Index of draw points.
	 * @param points - Array of points.
	 */
	private smoothCurve(i: number, points: any[]) {
		//Create the smooth function
		const s = Smooth(points, {
			method: Smooth.METHOD_CUBIC,
			//clip: Smooth.CLIP_PERIODIC,
			cubicTension: Smooth.CUBIC_TENSION_CATMULL_ROM
		});

		//average step distance
		const averageLineLength = 1;

		//	Incrementing the index by a constant amount does not result in a constant distance
		//	advancement.
		//
		//	To ameliorate this, we divide the segment into a few pieces and compute a
		//	different increment for each piece to approximate the advancement distance we want.

		const pieceCount = 1; //    should be a power of two so the for loop comes out exact

		for (let t = 0, step = 1 / pieceCount; t < 1; t += step) {
			const [start, end] = Array.from([s(i + t), s(i + t + (1 / pieceCount))]);
			const pieceLength = this.distance(start, end);
			//	Compute du so that we get the desired average line length
			const du = averageLineLength / pieceLength;

			for (let u = 0; u < 1 / pieceCount; u += du) {
				// @ts-ignore
				this.context.lineTo(...Array.from(s(i + t + u) || []));
			}
		}

		//	Ensure that the path actually passes through the end points
		// @ts-ignore
		return this.context.lineTo(...Array.from(s(i + 1) || []));
	}

	/**
	 * Return distance between two points. Pass arguments like [X_VALUE, Y_VALUE] for start and parameters.
	 */
	private distance(start: number[], end: number[]): number {
		const v = [end[0] - start[0], end[1] - start[1]];

		return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
	}

	/**
	 * Return/Set canvas element height.
	 */
	private cH(height?: number): number {
		if (height) {
			this.canvas.height = height;
		}

		return this.canvas.height;
	}

	/**
	 * Return/Set canvas element width.
	 */
	private cW(width?: number): number {
		if (width) {
			this.canvas.width = width;
		}

		return this.canvas.width;
	}

}
