<template>
	<div id="app">
		<div id="play-panel">
			<div class="play-control">
				<div
						class="play"
						@click="togglePlay()"
				>
					<img
							v-if="isPlay"
							src="/assets/images/pause-button.png"
							alt="pause-button"
					>
					<img
							v-else
							src="/assets/images/play-button.png"
							alt="play-button"
					>
				</div>
			</div>
			<div
					ref="progressControl"
					class="progress-control"
					@click="changePlayTime($event)"
			>
				<div class="bg"></div>
				<div
						ref="progress"
						class="progress"
						v-bind:style="{width: progressRate + '%'}"
				></div>
			</div>
			<div class="info">
				<div class="time">
					{{playTime}}
				</div>
			</div>
		</div>
		<div>
			<canvas
					ref="visualizer"
					id="visualizer"
					height="200"
			></canvas>
		</div>
		<div>
			<canvas
					ref="visualizerColumns"
					id="visualizer-columns"
					width="644"
					height="200"
			></canvas>
		</div>
	</div>
</template>

<script lang="ts">
	import {Component, Vue} from "vue-property-decorator";
	import HelloWorld from "./components/HelloWorld.vue";
	import EgoAudio from "./ego-audio";
	import EgoAudioVisualization from "@/ego-audio-visualization";

	@Component({
		components: {
			HelloWorld,

		},
	})
	export default class App extends Vue {

		//  Flag is audio file play now
		public isPlay = false;

		//  Progress play rate of audio file in percentage
		public progressRate = 0;

		//  Current play time
		public playTime = "0:00";

		//  Interval source
		private intervalSource: number;

		private egoAudio = new EgoAudio();

		//  Time on progress bar that must be play and reset after it
		private toPlayInTime: number|undefined;

		constructor() {
			super();
		}

		public mounted() {
			this.initInfoTime();

			this.egoAudio.loadUrl("/assets/music-2.mp3")
				.then((audioBuffer) => {
					this.egoAudio.buffer = audioBuffer;

					//  Set event listeners
					this.egoAudio.onPlay = () => {
						this.animateProgressBar();
					};

					this.egoAudio.onStop = () => {
						this.animateProgressBar();

						//this.isPlay = false;
					};

					//this.egoAudio.play();

					//  Curve
					const egoAudioVisualizationCurve = new EgoAudioVisualization();
					egoAudioVisualizationCurve.canvas = this.$refs.visualizer as HTMLCanvasElement;
					egoAudioVisualizationCurve.audioBuffer = audioBuffer;
					//egoAudioVisualizationCurve.drawCurve();

					//  Columns
					const egoAudioVisualizationColumns = new EgoAudioVisualization();
					egoAudioVisualizationColumns.canvas = this.$refs.visualizerColumns as HTMLCanvasElement;
					egoAudioVisualizationColumns.audioBuffer = audioBuffer;
					//egoAudioVisualizationColumns.drawColumns();
				});
		}

		initInfoTime(): void {
			this.intervalSource = setInterval(() => {
				if (!this.egoAudio.buffer) {
					return;
				}

				//  Generate human play time for control
				const playTime = this.egoAudio.playTime();
				this.playTime = Math.floor(playTime / 60) + ":";
				let seconds = "0" + Math.floor(playTime % 60);
				this.playTime = this.playTime + seconds.substr(seconds.length - 2);

				//  Stop play audio if it finished
				if (this.egoAudio.playTime() >= this.egoAudio.totalPlayTime) {
					this.isPlay = false;
					//this.egoAudio.stop();
					this.egoAudio.pause();
				}
			}, 100);
		}

		/**
		 * Toggle play track
		 */
		togglePlay(): void {
			this.isPlay = !this.isPlay;

			if (this.isPlay) {
				if (this.egoAudio.playTime() >= this.egoAudio.totalPlayTime) {
					this.egoAudio.play(0, 0);
				} else {
					this.egoAudio.play(0, this.toPlayInTime);
				}

				this.toPlayInTime = undefined;
			} else {
				this.egoAudio.pause();
			}
		}

		changePlayTime(e: MouseEvent): void {
			const target = (this.$refs.progressControl as HTMLElement);
			const rect = target.getBoundingClientRect();
			const posX = e.pageX - rect.left;
			this.progressRate = posX / rect.width * 100;
			this.progressRate = Math.floor(this.progressRate) + (Math.round(this.progressRate % 1 * 100) / 100);

			this.toPlayInTime = this.egoAudio.totalPlayTime * this.progressRate / 100;

			//  Change play time if audio track is play now
			if (this.egoAudio.isPlay()) {
				this.egoAudio.stop();
				this.egoAudio.play(0, this.toPlayInTime);

				//  Reset planning play time
				this.toPlayInTime = undefined;
			}
		}

		animateProgressBar(): void {
			const eProgress = this.$refs.progress as HTMLElement;

			//  Start animate
			if (this.egoAudio.isPlay()) {
				window.requestAnimationFrame(() => {
					eProgress.style.transition = "";
					eProgress.style.width = `${this.egoAudio.playTime() / this.egoAudio.totalPlayTime * 100}%`;

					window.requestAnimationFrame(() => {
						eProgress.style.transition = `width ${this.egoAudio.totalPlayTime - this.egoAudio.playTime()}s linear`;

						window.requestAnimationFrame(() => {
							eProgress.style.width = "100%";
						});
					});
				});

				return;
			}

			//  Stop animate
			window.requestAnimationFrame(() => {
				eProgress.style.transition = "";
				eProgress.style.width = `${this.egoAudio.playTime() / this.egoAudio.totalPlayTime * 100}%`;
			});
		}

	}
</script>

<style lang="scss">
	html {
		margin: 0;
		padding: 0;

		body {
			margin: 0;
			padding: 0;
		}
	}

	#app {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
		padding: 15px;
		margin-top: 60px;

		#play-panel {
			display: flex;
			width: 100%;

			.play-control {
				display: inline-flex;
				width: 50px;
				flex-shrink: 0;
				align-items: center;
				justify-content: center;
				cursor: pointer;

				.play {
					display: flex;
					align-items: center;

					img {
						width: 40px
					}
				}
			}

			.progress-control {
				position: relative;
				display: inline-flex;
				width: 100%;
				margin: 0 15px;
				flex-grow: 1;
				align-items: center;
				justify-content: center;
				cursor: pointer;

				> div {
					position: absolute;
					top: 0;
					bottom: 0;
					left: 0;
					margin: auto;
					display: block;
					width: 100%;
					height: 3px;
					border-radius: 3px;

					&.bg {
						background-color: #f7f7f7;
					}

					&.progress {
						background-color: #bfc0c6;
					}
				}
			}

			.info {
				display: inline-flex;
				width: 50px;
				align-items: center;
				justify-content: center;

				.time {
					text-align: center;
					font-size: 16px;
					color: #f7f7f7;
				}
			}
		}
	}
</style>
