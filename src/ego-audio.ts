export default class EgoAudio {

	//	Audio context
	public context: AudioContext;

	//	Audio buffer getter/setter
	public get buffer(): AudioBuffer {
		return this._buffer;
	}

	public set buffer(buffer: AudioBuffer) {
		this._buffer = buffer;

		//	Calculate total play time
		this.calcTotalPlayTime();
	}

	//	Buffer source
	public bufferSource: AudioBufferSourceNode;

	//	Total play time of the audio track
	public totalPlayTime: number;

	//	Gain node
	public gainNode: GainNode;

	/**
	 * Start play point when audio start plying use AudioContext.currentTime
	 */
	public pausedAt: number = 0;

	/**
	 * Last play point when was stopped or zero if not payed yet use AudioContext.currentTime
	 */
	public startPlayPoint: number = -1;

	//	Event on start play
	public onPlay: () => void;

	//	Event on stop play
	public onStop: () => void;

	//	Is audio play now
	private isPlayNow = false;

	//	Audio buffer
	private _buffer: AudioBuffer;

	constructor() {
		//	Check audio context browser supporting
		if ((window as any).AudioContext === undefined) {
			throw new Error('AudioContext not supported your browser.');
		}

		this.context = new AudioContext();

		//	Set gainNode node
		this.gainNode = this.context.createGain();
		this.gainNode.connect(this.context.destination);
		this.gainNode.gain.value = 0;
	}

	/**
	 * Play audio with method start() of AudioScheduledSourceNode so it use the parameters.
	 */
	public play(when?: number, offset?: number, duration?: number): void {
		//	Check empty buffer
		if (!this.buffer) {
			console.warn('Audio buffer is empty.');
		}

		if (offset === undefined) {
			offset = this.pausedAt;
		}

		//	Set buffer source
		this.bufferSource = this.context.createBufferSource();
		this.bufferSource.connect(this.context.destination);

		//	Bind gainNode node to source
		this.bufferSource.connect(this.gainNode);

		this.bufferSource.buffer = this.buffer;

		this.bufferSource.start(when, offset, duration);

		this.startPlayPoint = this.context.currentTime - offset;
		this.pausedAt = 0;
		this.isPlayNow = true;

		//	Call event
		if (this.onPlay) {
			this.onPlay();
		}
	}

	/**
	 * Stop play audio. By default stop at current time.
	 *
	 * @param {number} when - Time in seconds when stop play audio.
	 */
	public stop(when?: number): void {
		if (!when) {
			when = this.context.currentTime;
		}

		//	Update play points
		this.pausedAt = 0;
		this.startPlayPoint = -1;

		this.bufferSource.stop(when);

		this.isPlayNow = false;

		//	Call event
		if (this.onStop) {
			this.onStop();
		}
	}

	/**
	 * Pause track
	 */
	public pause(): void {
		if (this.startPlayPoint === -1) {
			return;
		}

		let offset = this.context.currentTime - this.startPlayPoint;

		if (offset > this.totalPlayTime) {
			offset = this.totalPlayTime;
		}

		this.stop();

		this.pausedAt = offset;
	}

	/**
	 * Return track current play time in seconds
	 */
	public playTime(): number {
		if (this.startPlayPoint === -1) {
			if (this.pausedAt > this.totalPlayTime) {
				return this.totalPlayTime;
			}

			return this.pausedAt;
		} else {
			const playTime = this.context.currentTime - this.startPlayPoint;

			if (playTime >= this.totalPlayTime) {
				return this.totalPlayTime;
			}

			return playTime;
		}
	}

	/**
	 * Return is audio track play now
	 */
	public isPlay(): boolean {
		return this.isPlayNow;
	}

	/**
	 * Load audio file from URL
	 */
	public loadUrl(url: string): Promise<AudioBuffer> {
		return new Promise<AudioBuffer>((resolve, reject) => {
			const request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';
			request.send();

			request.onload = () => {
				this.context.decodeAudioData(request.response)
					.then((audioBuffer) => {
						resolve(audioBuffer);
					})
					.catch((err) => {
						reject({
							message: `Error occurred while decode audio buffer.`,
							error: err
						});
					});
			};

			request.onerror = () => {
				reject({
					status: request.status,
					statusText: request.statusText
				});
			};
		});
	}

	/**
	 * Calculate total audio play time and save it to `totalPlayTime` property
	 */
	private calcTotalPlayTime(): void {
		if (!this.buffer) {
			return;
		}

		this.totalPlayTime = this.buffer.length / this.buffer.sampleRate;
	}

}
