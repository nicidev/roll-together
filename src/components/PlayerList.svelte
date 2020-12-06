<script>
    import PlayerStore from '../stores/PlayerStore.js';
</script>

<div>
    <h3>Current Players:</h3>
        {#each $PlayerStore as player (player.id)}
            <ul>
                {player.name}
            </ul>
        {/each}
</div>