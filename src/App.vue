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
					class="progress-control"
					@click="changePlayTime($event)"
			>
				<div class="bg"></div>
				<div
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
		public playTime = '0:00';

		//  Interval source
		private intervalSource: number;

		private egoAudio = new EgoAudio();

		constructor() {
			super();
		}

		public mounted() {
			this.initInfoTime();

			this.egoAudio.loadUrl("/assets/music-3.mp3")
				.then((audioBuffer) => {
					this.egoAudio.buffer = audioBuffer;

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

				const playTime = this.egoAudio.playTime();
				this.playTime = Math.floor(playTime / 60) + ':';
				let seconds = '0' + Math.floor(playTime % 60);

				this.playTime = this.playTime + seconds.substr(seconds.length - 2);
			}, 1000);
		}

		/**
		 * Toggle play track
		 */
		togglePlay(): void {
			this.isPlay = !this.isPlay;

			if (this.isPlay) {
				this.egoAudio.play();
			} else {
				this.egoAudio.pause();
			}
		}

		changePlayTime(e: MouseEvent): void {
			const target = (e.target as HTMLElement);
			const rect = target.getBoundingClientRect();
			const posX = e.pageX - rect.left;
			this.progressRate = Math.round(posX / rect.width * 100);

			console.log(this.progressRate);
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
