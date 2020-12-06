<script>
//	export let name;
	import Header from './components/Header.svelte';
	import Footer from './components/Footer.svelte';
	import Die from './components/Die.svelte';
	import Tabs from './shared/Tabs.svelte';
	import PlayerConfig from './components/PlayerConfig.svelte';
	import PlayerList from './components/PlayerList.svelte';
	
	let playerName = 'Nici';

	$: currentRoll = 6;
	const handleRoll = (name) => {
		currentRoll = Math.floor(Math.random() * 6) + 1;
		console.log(name + "rolled " + currentRoll);
	}
	
	//tabs
	let items = ['Player Config', 'Game'];
	let activeItem = 'Game';

	const tabChange = (e) => {
		activeItem = e.detail;
	};

	const handleAdd = () => {
    	activeItem = 'Game';
  	}
</script>
<Header/>

<main>
	<Tabs {activeItem} {items} on:tabChange={tabChange}/>
	{#if activeItem === 'Player Config'}
		<PlayerConfig name={playerName} on:add={handleAdd}/>
	{:else if activeItem === 'Game'}
		<div class="result">
			<Die numberRolled={currentRoll}  on:click={() => handleRoll(playerName)}/>
		</div>
		<PlayerList/>
	{/if}
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