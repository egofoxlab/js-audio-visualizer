export default class EgoAudioVisualizer {

	//	Audio context
	public audioContext: AudioContext;

	//	Audio source
	public audioSource: MediaElementAudioSourceNode | AudioBufferSourceNode;

	//	Audio visualizer type
	public audioVisualizer: 'colCubic';

	//	Analyzer
	private audioAnalyzer: AnalyserNode;

	//	Analyzer data array
	private audioAnalyzerDataArray: Uint8Array;

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

	//	HTML Canvas element
	private _canvas: HTMLCanvasElement;

	//	Canvas context
	public context: CanvasRenderingContext2D;

	public init() {
		this.audioAnalyzer = this.audioContext.createAnalyser();
		this.audioAnalyzer.fftSize = 128;
		this.audioAnalyzerDataArray = new Uint8Array(this.audioAnalyzer.frequencyBinCount);

		//	Connect
		this.audioAnalyzer.connect(this.audioContext.destination);
		this.audioSource.connect(this.audioAnalyzer);

		switch (this.audioVisualizer) {
			case 'colCubic':
				window.requestAnimationFrame(this.drawColCubic.bind(this));

				break;
		}
	}

	public destroy(): void {
		if (this.audioAnalyzer) {
			this.audioAnalyzer.disconnect();
		}

		if (this.audioContext) {
			this.audioSource.disconnect();
		}
	}

	private drawColCubic(): void {
		const cubicSize = 10;
		const colStep = 10;
		const cubicStep = 2;
		const color1 = '#d02d2d';
		const color2 = '#f3e478';

		//	Update analyzer data
		this.audioAnalyzer.getByteFrequencyData(this.audioAnalyzerDataArray);

		//	Start draw visualizer
		this.context.clearRect(0, 0, this.cW(), this.cH());
		let z = 0;

		for (let i = 0; i < this.audioAnalyzerDataArray.length; i++) {
			z++;
			const item = this.audioAnalyzerDataArray[i];
			const barHeight = item / 256 * this.cH();
			const x = i * (cubicSize + colStep);
			const cubicNumber = barHeight / (cubicSize + cubicStep);

			for (let yCubic = 1; yCubic <= cubicNumber; yCubic++) {
				let y;

				y = this.cH() - (yCubic * (cubicSize + cubicStep));

				const color = this.interpolateColors(color1, color2, (y - this.cH()) / this.cH());

				if (color) {
					this.context.fillStyle = color;
				}

				this.context.fillRect(
					x,
					y,
					cubicSize,
					cubicSize
				);
			}
		}

		window.requestAnimationFrame(this.drawColCubic.bind(this));
	}

	/**
	 * Interpolate between two colors
	 */
	private interpolateColors(
		//	Hex color
		color1: string,
		//	Hex color
		color2: string,
		//	Interpolate value in range [0, 1]
		value: number
	): string | null {
		const rgb1 = this.hexToRgb(color1);
		const rgb2 = this.hexToRgb(color2);

		if (rgb1 === null || rgb2 === null) {
			return null;
		}

		return this.rgbToHex(
			rgb1.r + Math.floor(value * (rgb1.r - rgb2.r)),
			rgb1.g + Math.floor(value * (rgb1.g - rgb2.g)),
			rgb1.b + Math.floor(value * (rgb1.b - rgb2.b))
		);
	}

	/**
	 * Convert hex to rgb color
	 */
	private hexToRgb(hex: string): {
		r: number,
		g: number,
		b: number
	} | null {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	/**
	 * Convert rgb to hex color
	 */
	private rgbToHex(r: number, g: number, b: number) {
		return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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
