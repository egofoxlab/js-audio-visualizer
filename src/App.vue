<template>
	<div id="app">
		<fieldset>
			<legend>Audio form</legend>
			<div>
				<input type="range" min="-100" max="100" id="volume">
			</div>
		</fieldset>
		<canvas id="visualizer" height="200"></canvas>
	</div>
</template>

<script lang="ts">
	import {Component, Vue} from 'vue-property-decorator';
	import HelloWorld from './components/HelloWorld.vue';
	import EgoAudio from './ego-audio';

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
			this.egoAudio.loadUrl('/assets/music.mp3')
				.then((audioBuffer) => {
					this.egoAudio.buffer = audioBuffer;

					this.egoAudio.play();

					setTimeout(() => {
						this.egoAudio.stop();
					}, 2000);

					setTimeout(() => {
						this.egoAudio.continue();
					}, 4000);
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
