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

	$: dicepusher = new DicePusher({
            network: {
                authEndpoint : "//gheist.net/api/pusher/auth/generic/presence/1098358",
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


	$: cardStatus = [];
	EventHub.listen(ClientEvent.ROLL_DICE, (roll) =>{
		lastRolls[roll.dice] = roll.eyes;
		console.log("Last Rolls: " + lastRolls);
		let roller = dicepusher.userlist.find(x =>x.id === roll.sender).name;
		let style = 'none';
		if(roll.eyes === 6){
			style = 'bold';
		}
		blockedDice[roll.dice] = true;
		cardStatus[roll.dice] = 'inactive';
		window.setTimeout(() =>{
			cardStatus[roll.dice] = 'active';
			blockedDice[roll.dice] = false;
			logEvent(roller + " hat eine " + roll.eyes + " gewürfelt", style);
		}, 3000);
	});

	EventHub.listen(DiceEvent.ROOM_USER_JOIN, (user) =>{
		console.log("User Joined Room: " + user.info.name);
		console.log("Current users: ");
		logEvent(user.info.name + " kommt in den Raum geschliddert")
	});

	$: missingDice = [];
	EventHub.listen(DiceEvent.ROOM_USER_LEAVE, (user) =>{
		console.log("User Left Room: " + user.info.name);
		logEvent(user.info.name + " ist gegangen... :( ")
		missingDice.push(user.id);
		console.log("Missing dice: " +  missingDice);
	});

	$: eventslog = [];

	let styleType = 'none';
	const logEvent = (message, style) => {
		let messageStyle = style || 'none';
		eventslog.unshift({id: eventslog.length, message:message, style:messageStyle});
		eventslog = eventslog;
	};


	const joinHandler = (e) => {
		credentials = e.detail;
		console.log("User "+ credentials.playerName + " is joining room " + credentials.roomName);
		logEvent("Hallo " + credentials.playerName);
		dicepusher.joinRoom(credentials.roomName, credentials.playerName);
	};

	const addDice = () => {
		dicepusher.addDice();
		lastRolls.push(1);
		logEvent("Huch! Ein neuer Würfel!");

	};

	$: dices = dicepusher.dices.map((diceHolder, diceId) =>{
		if(missingDice.indexOf(diceId) === -1){
			let tmp = {};
			tmp.id = diceId;
			tmp.user = dicepusher.users[diceHolder];
			tmp.yourTurn = false;
			if(tmp.user && tmp.user.id === dicepusher.self.id) {
				tmp.yourTurn = true;
			}
			return tmp;
		}
	});


	const handleRoll = (diceId) => {
		if(!blockedDice[diceId]){
			dicepusher.roll(diceId)
		}
	};
</script>
<Header/>
	<div class="setting">
		{#if dicepusher.self.firstUser === true}
			<Button on:click={addDice}>Add Dice</Button>
			<br>
		{/if}
		{#if dicepusher.status ===  DicePusherStatus.CONNECTED}
			Room {dicepusher.room}
		{/if}
	</div>
	<div class="eventlog">
		{#each eventslog as event}	
			<span class={event.style}>
				{event.message}
			</span>
		{/each}	
	</div>

<main>
	<div class="gamearea">
	{#if dicepusher.status ===  DicePusherStatus.SETUP}
		<Setup/>
	{:else if dicepusher.status ===  DicePusherStatus.ERROR}
		<Error/>
	{:else if dicepusher.status ===  DicePusherStatus.READY}
		<Join  on:joinRoom={joinHandler}/>
	{:else if dicepusher.status ===  DicePusherStatus.CONNECTED}
			<div>
				{#each dices as die}
					{#if die.user}
						<Card inactive={blockedDice[die.id]}>
							<div class="diespace">	
								{#if die.yourTurn}
									<p><b>Du<br>bist dran!</b></p>
									<img src="img/{lastRolls[die.id]||1}.gif" alt="Dice" on:click={() => handleRoll(die.id)} >
								{:else}
									<p>{die.user.name}<br>ist dran.</p>
									<img src="img/{lastRolls[die.id]||1}.gif" alt="Dice" >
								{/if}
							</div>
						</Card>
					{/if}
				{/each}
			</div>
		<div>
			<br>
			<b>Spieler:innen</b><br>
			{#each dicepusher.userlist as player}
			{#if missingDice.indexOf(player.id) === -1}
				{player.name}
				{#each dices as die}
					{#if die.user}
						{#if die.user.id === player.id}
							&#x1f3b2;
						{/if}
					{/if}
				{/each}
				<br>
			{/if}
			{/each}
		</div>
	{/if}
	</div>
	<div>
		<img class="imagepreload" src="img/1.gif" alt ="">
		<img class="imagepreload" src="img/2.gif" alt ="">
		<img class="imagepreload" src="img/3.gif" alt ="">
		<img class="imagepreload" src="img/4.gif" alt ="">
		<img class="imagepreload" src="img/5.gif" alt ="">
		<img class="imagepreload" src="img/6.gif" alt ="">
	</div>
</main>

<Footer/>
<style>
	main {
		text-align: center;
		max-width: 280px;
		margin: 0 auto;
		border-width: 2px;
	}

	.imagepreload{
		max-width: 1px;
		max-height: 1px;
	}

	.setting{
		position: absolute;
		font-family: 'Courier New', Courier, monospace;
		font-size: small;
		color: rgba(255,255,255,0.6);
		top: 0.5em;
		left: 1em;
	}

	.diespace{
		max-width: 100px;
	}

	.gamearea{
		border-width: 5px;
		border-color: rgb(95, 95, 95);
	}

	.eventlog{
		white-space: nowrap;
		background: #00CA7533;
    border-width: thin;
    border-color: darkgray;
    margin-top: 0.25em;
		overflow: hidden;
	}
	.eventlog span{
		display: inline-block;
		padding: 0 0.5em;
		position: relative;
	}

	.eventlog span::before{
		display: inline-block;
		content: "\2744";
		position: absolute;
		width: 1em;
		text-align: center;
		left: -0.5em;
	}

	.eventlog span:first-child::before{
		display: none;
	}

	.bold{
		font-weight: bold;
	}
	.none{
		font-weight: normal;
	}

</style>