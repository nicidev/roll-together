<script>
    import PlayerStore from '../stores/PlayerStore.js';
    import {createEventDispatcher} from 'svelte';
    import Button from '../shared/Button.svelte';
    let dispatch = createEventDispatcher();
    export let name='';
    let errorMessage ='';

    let valid = false;
    const submitHandler = () => {
        valid = true;

        if(name.trim().length < 3){
            errorMessage = 'Player name must be at least 3 character long.';
            valid = false;
        }else{
            errorMessage = '';
        }

        if(valid){
            let player = {id: Math.random(), name}
            PlayerStore.update(currentPlayers => {
                return [player, ...currentPlayers];
            });

            dispatch('add');
        }
    };

</script>
<form on:submit|preventDefault={submitHandler}>
    <div class="playerConfig">
        <label for="playerName">Player name</label>
        <input type="text" id="playerName"  bind:value={name}>
        <div class="error">{ errorMessage }</div>
        <Button inverse='true'>Save</Button>
    </div>
</form>

<style>
    .playerConfig{
        background: rgb(231, 231, 231);
        padding: 30px;
        border-radius: 6px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.5);
    }

    form{
    width: 50;
    margin: 0 auto;
    text-align: center;
  }

  input{
    width: 100%;
    border-radius: 6px;
    margin-bottom: 20px;
  }
  label{
    margin: 10px auto;
    text-align: left;
  }
  .error{
    font-weight: bold;
    font-size: 12px;
    color: #d91b42;
  }
</style>