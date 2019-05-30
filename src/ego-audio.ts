export class EgoAudio {

	constructor() {
		/*const eVisualizer = $('#visualizer');
		let context = new AudioContext();
		let analyser;
		let bufferLength;
		let dataArray;
		//  Volume
		const gainNode = context.createGain();
		let buffer, source;

		async function loadMusic(url) {
			const data = await fetch(url);
			const arrayBuffer = await data.arrayBuffer();

			return await context.decodeAudioData(arrayBuffer);
		}

		loadMusic('/music.mp3').then((_buffer) => {
			console.log(_buffer);

			//buffer = context.createBuffer(_buffer.numberOfChannels, _buffer.length, _buffer.sampleRate / 1);
			buffer = context.createBuffer(1, _buffer.length, _buffer.sampleRate / 1);

			//  Set channel data
			for (let channel = 0; channel < 1; channel++) {
				buffer.getChannelData(channel).set(_buffer.getChannelData(channel));
			}

			buffer = _buffer;
			console.log(buffer.numberOfChannels);

			play(buffer);
		});

		$('#volume').on('input', (e) => {
			const element = e.target;
			const volume = element.value;
			const fraction = parseInt(element.value) / parseInt(element.max);
			// Let's use an x*x curve (x-squared) since simple linear (x) does not
			// sound as good.
			console.log(fraction);
			gainNode.gain.value = fraction;

			//gainNode.gain.setValueAtTime(fraction, context.currentTime + 1);
			//gainNode.gain.value = volume;

			console.log(gainNode.gain.value);

			if (volume < .5) {
				//stop();
			} else {
				//play(buffer)
			}
		});

		function play(buffer) {
			source = context.createBufferSource();

			gainNode.connect(context.destination);
			source.connect(gainNode);

			source.connect(context.destination);

			source.buffer = buffer;
			source.start(0);

			/!*analyser = context.createAnalyser();
			analyser.fftSize = 2048;
			bufferLength = analyser.frequencyBinCount;
			dataArray = new Uint8Array(bufferLength);
			analyser.getByteTimeDomainData(dataArray);
			source.connect(analyser);*!/
		}

		function stop() {
			source.stop();
		}

		function drawGraph() {
			setCFullSize();
			//draw();

			const millStep = 100;
			const millLen = buffer.length / buffer.sampleRate * 1000 / millStep;
			const millLenPerStep = buffer.sampleRate / 1000 * millStep;
			const channelInfo = {};
			const audioGraph = [];
			const channelLen = 1;//buffer.numberOfChannels;

			eVisualizer.get(0).width = millLen;

			for (let channel = 0; channel < channelLen; channel++) {
				channelInfo[channel] = [];
				let average = 0;
				let i = 0;

				for (i = 0; i < buffer.getChannelData(channel).length; i++) {
					if (i > 0 && i % millLenPerStep === 0) {
						let item = (buffer.getChannelData(channel)[i] + 1) * (cH() / 2);
						//channelInfo[channel].push(average);
						channelInfo[channel].push(item);

						average = 0;
					}


					//average = item;
					//average = (average + item) / 2;
				}

				//  Add rest of average value of the last step
				if (i > 0 && i % millLenPerStep !== 0) {
					channelInfo[channel].push(average);
				}
			}

			for (let i = 0; i < channelInfo[0].length; i++) {
				let average = channelInfo[0][i];

				for (let channel = 1; channel < channelLen; channel++) {
					//average += average;
				}

				audioGraph.push([
					//  X
					i,
					//  Y
					cH() - average / channelLen
				]);
			}

			const ctx = getCCtx();
			ctx.strokeStyle = '#ff0000';
			ctx.beginPath();

			/!*const graph = [
				[10, cH() - 10],
				[50, cH() - 50],
				[100, cH() - 34],
				[150, cH() - 100],
				[200, cH() - 10],
			];*!/

			audioGraph.forEach((item, i) => {
				smoothCurve(getCCtx(), i, audioGraph);
			});

			console.log('Draw done');

			ctx.stroke();
		}

		function draw() {
			requestAnimationFrame(draw);
			analyser.getByteTimeDomainData(dataArray);

			const cCtx = getCCtx();

			//  Clear canvas
			cCtx.fillStyle = '#424242';
			cCtx.fillRect(0, 0, cW(), cH());

			//  Draw bars
			cCtx.fillStyle = '#7effb2';

			const data = [];

			dataArray.forEach((item, i) => {
				if (i % 4 !== 0) {
					return;
				}

				data.push(item);
			});

			const barHeight = cH() / 2;
			const barWidth = cW() / data.length;

			data.forEach((item, i) => {
				let height = item / 256 * barHeight;
				cCtx.fillRect(i * barWidth, cH() - height, barWidth, height);
			});
		}

		function smoothCurve(context, i, points) {
			//Create the smooth function
			const s = Smooth(points, {
				method: Smooth.METHOD_CUBIC,
				//clip: Smooth.CLIP_PERIODIC,
				cubicTension: Smooth.CUBIC_TENSION_CATMULL_ROM
			});

			//average step distance
			const averageLineLength = 1;

			//Incrementing the index by a constant amount does not result in a constant distance
			//advancement.
			//
			//To ameliorate this, we divide the segment into a few pieces and compute a
			//different increment for each piece to approximate the advancement distance we want.

			const pieceCount = 1; //    should be a power of two so the for loop comes out exact

			for (let t = 0, step = 1 / pieceCount; t < 1; t += step) {
				const [start, end] = Array.from([s(i + t), s(i + t + (1 / pieceCount))]);
				const pieceLength = distance(start, end);
				//compute du so that we get the desired average line length
				const du = averageLineLength / pieceLength;
				for (let u = 0; u < 1 / pieceCount; u += du) {
					context.lineTo(...Array.from(s(i + t + u) || []));
				}
			}

			//ensure that the path actually passes through the end points
			return context.lineTo(...Array.from(s(i + 1) || []));
		}

		function distance(start, end) {
			const v = [end[0] - start[0], end[1] - start[1]];

			return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
		}

		function setCFullSize() {
			eVisualizer.get(0).width = document.body.clientWidth;
			//eVisualizer.get(0).height = document.body.clientHeight;
		}

		/!**
		 * @returns {CanvasRenderingContext2D | WebGLRenderingContext}
		 *!/
		function getCCtx() {
			return eVisualizer.get(0).getContext('2d');
		}

		function cW() {
			return eVisualizer.get(0).width;
		}

		function cH() {
			return eVisualizer.get(0).height;
		}*/
	}

}
