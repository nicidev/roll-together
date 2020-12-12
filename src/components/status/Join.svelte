<script>
    import {createEventDispatcher} from 'svelte';
    import Button from '../../shared/Button.svelte';

    let dispatch = createEventDispatcher();
    export let credentials = {roomName:'' , playerName:''};

    let errorMessage ='';
    let errorMessageName ='';

    let valid = false;
    const submitHandler = () => {
        valid = true;

        if(credentials.roomName.trim().length < 3){
            errorMessage = 'Der Raum name ist zu kurz...';
            valid = false;
        }
        if(credentials.playerName.trim().length < 1){
            errorMessageName = 'Hast du keinen Namen?'
            valid = false;
        }
        if(valid){
            errorMessage = '';
            dispatch('joinRoom', credentials);
        }
    };

</script>
<h3>Willkommen beim Accso Wichtelgewusel</h3>

<div on:submit>
    <form on:submit|preventDefault={submitHandler}>
        <div class="join">
            <label for="room-id">Raum</label>
            <input type="text" placeholder="Fancy-room-name" bind:value={credentials.roomName}>
            <div class="error">{ errorMessage }</div>

            <label for="room-id">Dein Name</label>
            <input type="text" placeholder="Dicey McDiceface" bind:value={credentials.playerName}>
            <div class="error">{ errorMessageName }</div>
            <br>
            <Button  type="secondary">Tritt ein</Button>
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
    .error{
        font-size: smaller;
        font-weight: bold;
        color: crimson;
    }
</style>