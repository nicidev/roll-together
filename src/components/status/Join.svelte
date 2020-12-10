<script>
    import {createEventDispatcher} from 'svelte';
    import Button from '../../shared/Button.svelte';

    let dispatch = createEventDispatcher();
    export let credentials = {roomName:'' , playerName:''};

    let errorMessage ='';

    let valid = false;
    const submitHandler = () => {
        valid = true;

        if(credentials.roomName.trim().length < 3){
            errorMessage = 'Room name must be at least 3 character long.';
            valid = false;
        }else{
            errorMessage = '';
            dispatch('joinRoom', credentials);
        }
    };

</script>
<h3>Ready to join a room</h3>

<div on:submit>
    <form on:submit|preventDefault={submitHandler}>
        <div class="join">
            <label for="room-id">Room name</label>
            <input type="text" placeholder="Fancy-room-name" bind:value={credentials.roomName}>
            <div class="error">{ errorMessage }</div>

            <label for="room-id">Your name</label>
            <input type="text" placeholder="Dicey McDiceface" bind:value={credentials.playerName}>
            <div class="error">{ errorMessage }</div>
            <Button  type="secondary" >Join</Button>
        </div>
    </form>
</div>

<style>
    label{
        padding: 10px;
    }
    input{
        padding: 10px;

    }
</style>