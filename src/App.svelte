<script lang="ts">
	import { Router, Route } from "svelte-routing";
	import Home from "./routes/upload_view.svelte";
	import Overview from "./routes/overview_view.svelte";
	import WarView from "./routes/war_view.svelte";
	import PlayerView from "./routes/player_view.svelte";
	import GuildView from "./routes/guild_view.svelte";
</script>

<main>
	<Router>
		<Route path="overview"><Overview /></Route>
		<Route path="global/:guild/:name" let:params
			><PlayerView
				player_name={params.name}
				player_guild={params.guild}
			/></Route
		>
		<Route path="global/:guild" let:params
			><GuildView guild_name={params.guild} /></Route
		>
		<Route path="/:war" let:params><WarView war_name={params.war} /></Route>
		<Route path="/"><Home /></Route>
	</Router>
</main>

<style>
	@import "https://cdn.jsdelivr.net/npm/gridjs/dist/theme/mermaid.min.css";
	:global(body) {
		background-color: #121212;
	}
	:global(:root) {
		--primary-color: rgb(33, 150, 243);
		--background-color: #121212;
	}
	main {
		text-align: center;
		padding: 1em;
		height: 100%;
		box-sizing: border-box;
		width: 100%;
		color: white;
	}

	:global(::-webkit-scrollbar) {
		width: 5px;
		height: 5px;
	}

	:global(::-webkit-scrollbar-track) {
		background: var(--background-color);
	}

	:global(::-webkit-scrollbar-thumb) {
		background: white;
		border-radius: 8px;
	}
</style>
