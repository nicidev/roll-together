<script>
//	export let name;
	import { DicePusher} from "./pusher/dicepusher.js";
	import { DicePusherStatus } from "./pusher/dicepusher.js";
	import Card from './shared/Card.svelte';
	import Header from './components/Header.svelte';
	import Footer from './components/Footer.svelte';
	import Error from './components/status/Error.svelte';
	import Setup from './components/status/Setup.svelte';
	import Join from './components/status/Join.svelte';
	import Button from './shared/Button.svelte';
	import { EventHub } from "./pusher/eventhub.js";
	import { ClientEvent, DiceEvent } from "./pusher/events.js";
import { update_slot_spread } from "svelte/internal";

	$: dicepusher = new DicePusher({
            network: {
                authEndpoint : "http://gheist.net/api/pusher/auth/generic/presence/1098358",
                appKey : "d209ebf4ad2e3647739c"
            }
		});	

	$: lastRolls = [1];
	$: blockedDice = [];	
	$: playerList = [];

	let credentials = {roomName:'' , playerName:''};
	document.body.addEventListener('dice-pusher-updated', () => {
		dicepusher = dicepusher;
		console.log("Updated DicePusher")
		console.log("Users: " );
	});

	EventHub.listen(ClientEvent.ROLL_DICE, (roll) =>{
		lastRolls[roll.dice] = roll.eyes;
		console.log("Last Rolls: " + lastRolls);
		blockedDice[roll.dice] = true;
		window.setTimeout(() =>{
			blockedDice[roll.dice] = false;
		}, 2500);
	});

	EventHub.listen(DiceEvent.ROOM_USER_JOIN, (user) =>{
		console.log("User Joined Room: " + user.info.name);
		console.log("Current users: ");
		playerList = [];
		dicepusher.userlist.map((user) => {
			let tmp = {};
			tmp.id = user.id; 
			tmp.name = user.name || "anonymous?";
			playerList.push(tmp);
			console.log("\n" + tmp.name)
		})

		let newUser = {};
		newUser.id = user.info.id;
		newUser.name = user.info.name;
		playerList.push(newUser);
	});

	EventHub.listen(DiceEvent.ROOM_USER_LEAVE, (user) =>{
		console.log("User Left Room: " + user.info.name);
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
<div>
	<div class="setting">
		{#if dicepusher.self.firstUser === true}
			<Button on:click={addDice}>Add Dice</Button>
			<br>
		{/if}
	</div>
</div>

<main>
	<div class="playerlist">
		
	</div>
	<div class="gamearea">
	{#if dicepusher.status ===  DicePusherStatus.SETUP}
		<Setup/>
	{:else if dicepusher.status ===  DicePusherStatus.ERROR}
		<Error/>
	{:else if dicepusher.status ===  DicePusherStatus.READY}
		<Join  on:joinRoom={joinHandler}/>
	{:else if dicepusher.status ===  DicePusherStatus.CONNECTED}
		<h3>Room {dicepusher.room}</h3>
			<div>
				{#each dices as die}
				<Card>
					<div class="diespace">
						{#if die.yourTurn}
							<p><b>Du<br>bist dran!</b></p>
							<img src="../img/{lastRolls[die.id]||1}.gif" alt="Dice" on:click={() => handleRoll(die.id)} >
						{:else}
							<p>{die.user.name}<br>ist dran.</p>
							<img src="../img/{lastRolls[die.id]||1}.gif" alt="Dice" >
						{/if}
					</div>
				</Card>
				{/each}
			</div>
		<div>
			<br>
			<b>Spieler:innen</b><br>
			{#each dicepusher.userlist as player}
				{player.name}
				{#each dices as die}
					{#if die.user.id === player.id}
						&#x1f3b2;
					{/if}
				{/each}
				<br>
			{/each}
		</div>
	{/if}
	</div>

</main>

<Footer/>
<style>
	main {
		text-align: center;
		max-width: 240px;
		margin: 0 auto;
		border-width: 2px;
	}

	.diespace{
		max-width: 100px;
	}

	.gamearea{
		border-width: 5px;
		border-color: rgb(95, 95, 95);
	}

</style>