<script>
    export let type = 'primary';
    export let flat = true;
    export let inverse = false;


</script>

<button class={type} class:flat={flat} class:inverse={inverse} on:click>
    <slot></slot>
</button>

<style>
    button{
        border: 0;
        cursor: pointer;
        border-radius: 6px;
        padding: 8px, 12px;
        font-weight: bold;
        box-shadow: 1px 2px 3px rgb(0, 0, 0, 0.5);

    }

    .primary{
        background: #d91b42;
        color: white;
    }

    .secondary{
        background: #45c496;
        color: white;
    }

    .flat{
        box-shadow: none;
    }

    .primary.inverse{
        color: #d91b42;
        background: white;
        border: 2px solid #d91b42;
    }

    .secondary.inverse{
        color: #00CA75;
        background-color: white;
        border: 2px solid #00CA75;
    }


</style>