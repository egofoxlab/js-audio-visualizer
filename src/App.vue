<template>
	<div id="app">
		<div
				id="greetings"
				:class="{'hide': !showGreetings}"
				@click="showGreetings = false"
		>
			<span>
				Click every where for continue...
			</span>
		</div>

		<div id="main-content">
			<!--Upload file-->
			<div id="upload">
				<input
						ref="inputFile"
						type="file"
						@change="eventUploadFile($event)"
						accept="audio/*"
						class="hide"
				>
				<div
						class="button"
						@click="eventUpload()"
				>
				<span>
					Upload File
				</span>
				</div>
			</div>

			<!--Player-->
			<div id="player">
				<audio
						ref="player"
						src="/assets/music-1.mp3"
						controls
				></audio>
			</div>

			<!--Visualizer-->
			<div id="visualizer">
				<canvas
						ref="canvas"
				></canvas>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
	import {Component, Vue} from "vue-property-decorator";
	import HelloWorld from "./components/HelloWorld.vue";
	import EgoAudioVisualizer from "@/ego-audio-visualizer";

	declare const p5: any;

	@Component({
		components: {
			HelloWorld,

		},
	})
	export default class App extends Vue {

		//  Show greetings
		public showGreetings = true;

		//  Audio player
		private player: HTMLAudioElement;

		//  Audio context
		private audioContext: AudioContext;

		//  Audio source
		private audioSource: MediaElementAudioSourceNode;

		//  Audio visualizer
		private egoAudioVisualizer: EgoAudioVisualizer;

		constructor() {
			super();
		}

		public mounted() {
			this.player = this.$refs.player as HTMLAudioElement;

			//  Resize canvas on window change
			this.resizeCanvas();

			window.addEventListener('resize', () => {
				this.resizeCanvas();
			});

			//  Bootstrap preparation
			const bootstrapHandler = () => {
				document.removeEventListener('click', bootstrapHandler);

				this.audioContext = new AudioContext();

				this.visualizer();
			};
			document.addEventListener('click', bootstrapHandler);
		}

		public eventUpload(): void {
			(this.$refs.inputFile as HTMLInputElement).dispatchEvent(new MouseEvent('click'));
		}

		public eventUploadFile(e: any) {
			this.player.src = URL.createObjectURL(e.target.files[0]);
			this.player.load();
			this.player.play();

			this.visualizer();
		}

		/**
		 * Visualize audio
		 */
		public visualizer(): void {
			//  Start audio visualizer
			//  At first destroy old analyzer
			if (this.egoAudioVisualizer) {
				this.egoAudioVisualizer.destroy();
			}

			this.egoAudioVisualizer = new EgoAudioVisualizer();

			if (!this.audioSource) {
				this.audioSource = this.audioContext.createMediaElementSource(this.player);
			}

			//  Audio canvas
			this.egoAudioVisualizer.canvas = this.$refs.canvas as HTMLCanvasElement;

			//  Audio data
			this.egoAudioVisualizer.audioContext = this.audioContext;
			this.egoAudioVisualizer.audioSource = this.audioSource;
			this.egoAudioVisualizer.audioVisualizer = 'colCubic';

			this.egoAudioVisualizer.init();
		}

		/**
		 * Adapt canvas size for window
		 */
		private resizeCanvas(): void {
			const canvas = this.$refs.canvas as HTMLCanvasElement;
			canvas.width = window.document.body.offsetWidth;
			canvas.height = window.document.body.offsetHeight - 300;
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

	#greetings {
		position: fixed;
		display: flex;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
		background-color: #404254c7;
		z-index: 999;

		span {
			font-size: 40px;
			color: #fff;
		}
	}

	#app {
		display: flex;
		height: 100vh;
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;

		#main-content {
			display: flex;
			width: 100%;
			flex-direction: column;
			padding: 15px;
			padding-bottom: 100px;
		}

		#upload {
			display: flex;
			margin-top: 40px;
			margin-bottom: 15px;
			justify-content: center;

			.button {
				display: inline-flex;
				width: 250px;
				height: 100px;
				justify-content: center;
				align-items: center;
				border-radius: 10px;
				border: 3px dashed #949496;
				cursor: pointer;

				&:hover {
					box-shadow: 0 0 17px #9494965e;

					span {
						color: #c7c7c9;
					}
				}

				span {
					color: #949496;
					font-size: 22px;
				}
			}
		}

		#player {
			position: fixed;
			left: 0;
			bottom: 15px;
			width: calc(100% - 30px);
			padding: 0 15px;

			audio {
				width: 100%;
			}
		}

		#visualizer {
			height: 100%;
			display: flex;
			align-items: flex-end;
			justify-content: flex-end;
			overflow: hidden;

			canvas {
				width: 100%;
			}
		}
	}

	.hide {
		display: none !important;
	}
</style>
