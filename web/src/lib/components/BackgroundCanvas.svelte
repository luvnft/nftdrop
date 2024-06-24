<script>
	import { onMount } from 'svelte';

	/**
	 * @type {HTMLCanvasElement}
	 * The canvas element used for rendering the background effect.
	 */
	let canvas;

	/**
	 * @type {CanvasRenderingContext2D | null}
	 * The 2D rendering context for the canvas.
	 */
	let ctx;

	/**
	 * @type {number}
	 * The width of the canvas in pixels.
	 */
	let width;

	/**
	 * @type {number}
	 * The height of the canvas in pixels.
	 */
	let height;

	/**
	 * @type {Array<{
	 *   x: number,
	 *   y: number,
	 *   radius: number,
	 *   speed: number,
	 *   alpha: number,
	 *   direction: number,
	 *   brightness: number
	 * }>}
	 * An array of particle objects, each representing a point in the background effect.
	 */
	let particles = [];

	/**
	 * @type {{x: number, y: number}}
	 * An object representing the current mouse position on the canvas.
	 */
	let mouse = { x: 0, y: 0 };

	let isDarkMode = false;

	onMount(() => {
		isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

		width = window.innerWidth;
		height = window.innerHeight;
		canvas.width = width;
		canvas.height = height;
		ctx = canvas.getContext('2d');

		if (!ctx) return;

		for (let i = 0; i < 88; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				radius: Math.random() * 1.5 + 0.5,
				speed: 0.1 + Math.random() * 0.5,
				brightness: Math.random(),
				alpha: 0.1 + Math.random() * 0.3,
				direction: Math.random() * Math.PI * 2
			});
		}

		animate();
	});

	function animate() {
		if (!ctx) return;
		ctx.clearRect(0, 0, width, height);

		for (let particle of particles) {
			particle.x += Math.cos(particle.direction) * particle.speed;
			particle.y += Math.sin(particle.direction) * particle.speed;

			if (particle.x < 0) particle.x = width;
			if (particle.x > width) particle.x = 0;
			if (particle.y < 0) particle.y = height;
			if (particle.y > height) particle.y = 0;

			particle.alpha = 0.1 + Math.abs(Math.sin(Date.now() * 0.001 * particle.speed)) * 0.3;

			ctx.beginPath();
			ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
			if (isDarkMode) {
				ctx.fillStyle = `hsla(${60 + particle.brightness * 30}, 100%, ${50 + particle.brightness * 50}%, ${particle.alpha})`;
			} else {
				// Darker colors for light mode
				ctx.fillStyle = `hsla(${210 + particle.brightness * 30}, 70%, ${30 + particle.brightness * 20}%, ${particle.alpha * 2})`;
			}
			ctx.fill();
		}

		requestAnimationFrame(animate);
	}

	/**
	 * @param {{ clientX: number; clientY: number; }} event
	 */
	function handleMouseMove(event) {
		mouse.x = event.clientX;
		mouse.y = event.clientY;
	}
</script>

<svelte:window on:mousemove={handleMouseMove} />

<canvas bind:this={canvas} class="background-canvas"></canvas>

<style>
	.background-canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
		opacity: 1;
		background: radial-gradient(ellipse at bottom, #ffffff 0%, #e9e9e9 100%);
	}

	@media (prefers-color-scheme: dark) {
		.background-canvas {
			background: radial-gradient(ellipse at bottom, #121a23 0%, #020304 100%);
		}
	}
</style>
