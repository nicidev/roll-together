<script>
//	export let name;
	import Header from './components/Header.svelte';
	import Footer from './components/Footer.svelte';
	import Button from './shared/Button.svelte';
	import Die from './components/Die.svelte';
	import Tab from './components/Tabs.svelte';

	$: currentRoll = 6;
	const handleRoll = () => {
		currentRoll = Math.floor(Math.random() * 6) + 1;
		console.log(currentRoll);
	}

	let playerName = '';

</script>
<Header/>

<main>
	<div>
		<label for="playerName">Player name</label>
		<input type="text" id="playerName" bind:value={playerName}>
	</div>


	<div class="result">
		<Die numberRolled={currentRoll}  on:click={() => handleRoll()}/>
	</div>
</main>

<Footer/>
<style>
	main {
		text-align: center;
		padding: 5em;
		max-width: 240px;
		margin: 0 auto;
	}

</style>