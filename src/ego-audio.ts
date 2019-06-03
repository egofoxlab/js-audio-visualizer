export default class EgoAudio {

	//	Audio context
	public context: AudioContext;

	//	Audio buffer
	public buffer: AudioBuffer;

	//	Buffer source
	public bufferSource: AudioBufferSourceNode;

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

		if (!offset) {
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

		//	Save last play point
		this.pausedAt = 0;
		this.startPlayPoint = -1;

		this.bufferSource.stop(when);
	}

	/**
	 * Pause track
	 */
	public pause(): void {
		const offset = this.context.currentTime - this.startPlayPoint;

		this.stop();

		this.pausedAt = offset;
	}

	public playTime(): number {
		if (this.startPlayPoint === -1) {
			return this.pausedAt;
		} else {
			return this.context.currentTime - this.startPlayPoint;
		}
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

}
