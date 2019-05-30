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

	@Component({
		components: {
			HelloWorld,

		},
	})
	export default class App extends Vue {
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
