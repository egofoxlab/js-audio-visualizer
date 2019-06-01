<template>
	<div id="app">
		<fieldset>
			<legend>Audio form</legend>
			<div>
				<input type="range" min="-100" max="100" id="volume">
			</div>
		</fieldset>
		<div>
			<canvas ref="visualizer" id="visualizer" height="200"></canvas>
		</div>
		<div>
			<canvas ref="visualizerColumns" id="visualizer-columns" width="644" height="200"></canvas>
		</div>
	</div>
</template>

<script lang="ts">
	import {Component, Vue} from 'vue-property-decorator';
	import HelloWorld from './components/HelloWorld.vue';
	import EgoAudio from './ego-audio';
	import EgoAudioVisualization from "@/ego-audio-visualization";

	@Component({
		components: {
			HelloWorld,

		},
	})
	export default class App extends Vue {

		private egoAudio = new EgoAudio();

		constructor() {
			super();
		}

		public mounted() {
			this.egoAudio.loadUrl('/assets/music-3.mp3')
				.then((audioBuffer) => {
					this.egoAudio.buffer = audioBuffer;

					//this.egoAudio.play();

					//  Curve
					const egoAudioVisualizationCurve = new EgoAudioVisualization();
					egoAudioVisualizationCurve.canvas = this.$refs.visualizer as HTMLCanvasElement;
					egoAudioVisualizationCurve.audioBuffer = audioBuffer;
					egoAudioVisualizationCurve.drawCurve();

					//  Columns
					const egoAudioVisualizationColumns = new EgoAudioVisualization();
					egoAudioVisualizationColumns.canvas = this.$refs.visualizerColumns as HTMLCanvasElement;
					egoAudioVisualizationColumns.audioBuffer = audioBuffer;
					egoAudioVisualizationColumns.drawColumns();
				});
		}

	}
</script>

<style lang="scss">
	#app {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
		margin-top: 60px;
	}
</style>
