<script lang="ts">
	import { navigate } from "svelte-routing";
	import { ArrowLeftIcon } from "svelte-feather-icons";
	import { wars } from "../store";

	function navigate_back() {
		navigate("/");
	}

	$: {
		if ($wars.length == 0) {
			setTimeout(() => navigate("/"), 1);
		}
	}
</script>

<div on:click={navigate_back} class="back_button">
	<ArrowLeftIcon size="2x" />
</div>
<h1>Overview</h1>
<div class="container">
	{#each $wars as war}
		<div class="war_container" on:click={() => navigate(`/${war.name}`)}>
			<span>{war.name}</span>
			<div class="war_details">
				<span>{war.player_count} tracked players.</span>
				<span>{war.guilds.length} guilds.</span>
				<span
					>Your Guild K/D: {war
						.get_guild("Guild")
						.kd.toFixed(2)}</span
				>
			</div>
		</div>
	{/each}
	<!-- <div class="add_war">Add war</div> -->
	{#each Array(10) as _}
		<div class="filler" />
	{/each}
</div>

<style lang="scss">
	.back_button {
		position: absolute;
		left: 16px;
		transform: translate(50%, 80%);
		cursor: pointer;
	}
	.container {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.war_container,
	.add_war {
		border: 0.125em dashed var(--primary-color);
		border-radius: 1.5625em;
		padding: 1rem;
		transition: all 50ms;
		cursor: pointer;
		width: 180px;
		box-sizing: border-box;
		height: 130px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.filler {
		width: 180px;
	}

	.war_container > span {
		font-size: 1.5rem;
	}

	.war_container div {
		display: flex;
		flex-direction: column;
	}

	.war_container:hover {
		transform: scale(1.03);
	}
</style>
