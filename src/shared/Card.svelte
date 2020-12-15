<script>
  export let inactive = false;
  $: disabled = inactive;

</script>

<div class="card" class:inactive={disabled}>
  <slot></slot>
</div>

<style>
  .card{
    background: #fff;
    border-radius: 6px;
    box-shadow: 0px 2px 4px rgba(0,0,0,0.6);
    display: inline-block;
    margin: 7px 5px 5px 10px;
    padding: 0 4px;
  }

  .inactive{
    outline: none;
    box-shadow: inset 0px 0px 4px rgba(0,0,0,0.6);
  }
</style>