<script>
//	export let name;
	import { DicePusher} from "./pusher/dicepusher.js";
	import { DicePusherStatus } from "./pusher/dicepusher.js";

	import Header from './components/Header.svelte';
	import Footer from './components/Footer.svelte';
	import Error from './components/status/Error.svelte';
	import Setup from './components/status/Setup.svelte';
	import Join from './components/status/Join.svelte';
	import Button from './shared/Button.svelte';
	import { EventHub } from "./pusher/eventhub.js";
	import { ClientEvent } from "./pusher/events.js";


	
	// //tabs
	// let items = ['Player Config', 'Game'];
	// let activeItem = 'Game';

	// const tabChange = (e) => {
	// 	activeItem = e.detail;
	// };

	// const handleAdd = () => {
    // 	activeItem = 'Game';
	//   }
	$: dicepusher = new DicePusher({
            network: {
                authEndpoint : "http://gheist.net/api/pusher/auth/generic/presence/1098358",
                appKey : "d209ebf4ad2e3647739c"
            }
		});	

	$: lastRolls = [1];
	$: blockedDice = [];

	let credentials = {roomName:'' , playerName:''};
	document.body.addEventListener('dice-pusher-updated', () => {
		dicepusher = dicepusher;
		console.log("Updated DicePusher")
	});

	EventHub.listen(ClientEvent.ROLL_DICE, (roll) =>{
		lastRolls[roll.dice] = roll.eyes;
		console.log("Last Rolls: " + lastRolls);
		blockedDice[roll.dice] = true;
		window.setTimeout(() =>{
			blockedDice[roll.dice] = false;
		}, 4500);
	});



	const joinHandler = (e) => {
		credentials = e.detail;
		console.log("User "+ credentials.playerName + " is joining room " + credentials.roomName);
		dicepusher.joinRoom(credentials.roomName, credentials.playerName);
		console.log("DicePusher: " + dicepusher);
	};

	const addDice = () => {
		dicepusher.addDice();
		lastRolls.push(1);

	};

	$: dices = dicepusher.dices.map((diceHolder, diceId) =>{
		let tmp = {};
		tmp.id = diceId;
		tmp.user = dicepusher.users[diceHolder];
		tmp.yourTurn = false;
		if(tmp.user && tmp.user.id === dicepusher.self.id) {
			tmp.yourTurn = true;
		}

		return tmp;
	});


	const handleRoll = (diceId) => {
		if(!blockedDice[diceId]){
			dicepusher.roll(diceId)
		}
	};
</script>
<Header/>

<main>
	{#if dicepusher.status ===  DicePusherStatus.SETUP}
		<Setup/>
	{:else if dicepusher.status ===  DicePusherStatus.ERROR}
		<Error/>
	{:else if dicepusher.status ===  DicePusherStatus.READY}
		<Join  on:joinRoom={joinHandler}/>
	{:else if dicepusher.status ===  DicePusherStatus.CONNECTED}
		<h3>Room {dicepusher.room}</h3>
		<div>
		{#if dicepusher.self.firstUser === true}
			<Button on:click={addDice}>Add Dice</Button>
			<br>
		{/if}

		{#each dices as die}
			{die.user.name} holds this die.
			{#if die.yourTurn}
				{#if blockedDice[die.id]}
				WAIT!
				{/if}
				<img src="../img/{lastRolls[die.id]||1}.gif" alt="Dice" on:click={() => handleRoll(die.id)} >
			{:else}
				<img src="../img/{lastRolls[die.id]||1}.gif" alt="Dice" >
			{/if}
		{/each}
		
		</div>
		
	{/if}


	<!-- <Tabs {activeItem} {items} on:tabChange={tabChange}/>
	{#if activeItem === 'Player Config'}
		<PlayerConfig name={playerName} on:add={handleAdd}/>
	{:else if activeItem === 'Game'}
		<div class="result">
			<Die numberRolled={currentRoll}  on:click={() => handleRoll(playerName)}/>
		</div>
		<PlayerList/>
	{/if} -->
	

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