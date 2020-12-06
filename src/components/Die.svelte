<script>
    export let numberRolled;
    $: imageNumber = numberRolled || 6
</script>

<div class="die" on:click>
    <img src="img/{imageNumber}.gif" alt={imageNumber}>
</div>

<style>

</style>