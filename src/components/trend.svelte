<script lang="ts">
    export let value = 0;
</script>

<div class="trend">
    <span
        class:arrow={value != 0}
        class:up={value > 0}
        class:down={value < 0}
        class:dot={value == 0}
    />
    <span>{Math.abs(value)}</span>
</div>

<style>
    .trend {
        display: flex;
        font-size: 0.55rem;
        position: relative;
        width: 25px;
        justify-content: center;
    }
    .dot {
        border: solid white;
        border-radius: 50%;
        display: inline-block;
        position: absolute;
        padding: 2px;
        left: 50%;
        transform: translateX(-50%);
    }
    .arrow {
        border: solid white;
        border-width: 0 2px 2px 0;
        display: inline-block;
        padding: 2px;
        position: absolute;
        left: -20%;
        top: 50%;
    }

    .up {
        transform: rotate(-135deg);
        transform: rotate(-135deg) translateX(50%);
    }

    .down {
        transform: rotate(45deg);
        transform: rotate(45deg) translateX(-50%);
    }
</style>
