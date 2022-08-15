<script lang="ts">
	export let guild_name = "";
	import { navigate } from "svelte-routing";
	import Chart from "svelte-frappe-charts";
	import Grid from "gridjs-svelte";
	import { wars } from "../store";

	import type { Player } from "../types/player";
	import { Guild, War } from "../types/war";
	import { CheckboxGroup } from "attractions";
	import html2canvas from "html2canvas";

	export let player_guild = "";

	let all_wars: War[] = [];
	let guild_stats: Guild[] = [];
	let war_stats: War[] = [];
	let player_stats: { [name: string]: Player[] } = {};

	let checkbox_data = [];

	let selected_wars: War[] = [];

	$: {
		all_wars = $wars;

		let found_guild = false;

		for (let war of all_wars) {
			if (war.guilds.find((guild) => guild.name == guild_name)) {
				found_guild = true;
			}
		}

		if (!found_guild) {
			setTimeout(() => navigate("/"), 1);
		} else {
			update_checkboxes();
		}
	}

	// refreshes selected player, when player_name
	$: {
		guild_stats = [];
		war_stats = [];
		player_stats = {};

		// get all selected wars
		const checked_checkboxes = checkbox_data.filter((ch) => ch.checked).map((ch) => ch.value);
		selected_wars = all_wars.filter((w) => checked_checkboxes.includes(w.name));

		// get stats for the selected wars
		for (let war of selected_wars) {
			for (let guild of war.guilds) {
				if (guild.name == guild_name) {
					guild_stats.push(guild);
					war_stats.push(war);
					for (let player of guild.players) {
						let p = player_stats[player.name];
						if (!p) p = player_stats[player.name] = [];
						p.push(player);
					}
				}
			}
		}

		update();
	}

	// init all checkboxes
	function update_checkboxes() {
		for (let war of all_wars) {
			if (war.guilds.find((g) => g.name == guild_name)) {
				checkbox_data.push({ value: war.name, checked: true });
			}
		}
	}

	/** called when user unticks/ticks a checkbox */
	function on_checkbox_change(e: CustomEvent<{ value: string; checked: boolean; nativeEvent: Event }>) {
		checkbox_data = checkbox_data;
		update();
	}

	function update() {
		update_stats();
		update_grid();
		update_chart();
	}

	function update_stats() {
		kill_count = get_kill_count();
		death_count = get_death_count();
		avg_kill_count = +get_avg_kills();
		avg_death_count = +get_avg_deaths();
		avg_kd = +get_avg_kd();
		player_count = get_player_count();
	}

	function update_grid() {
		const results = [];
		for (let key of Object.keys(player_stats)) {
			const player = player_stats[key];
			const player_name = player[0].name;

			// calculate % of wars joined
			const join_percentage = +((player.length / guild_stats.length) * 100).toFixed(0);

			const avg_kills = War.get_avg_kills_players(player_name, selected_wars).toFixed(2);
			const avg_deaths = War.get_avg_deaths_players(player_name, selected_wars).toFixed(2);
			const avg_kd = War.get_avg_kd_players(player_name, selected_wars).toFixed(2);

			results.push({
				name: player[0].name,
				kills: +avg_kills,
				deaths: +avg_deaths,
				kd: +avg_kd,
				joined: join_percentage,
			});
		}

		items = results;
	}

	function update_chart() {
		const labels = war_stats.map((war) => war.name);

		const guild_data = guild_stats.map((guild) => +guild.kd.toFixed(2));

		data.labels = labels;
		data.datasets = [
			{
				values: guild_data,
				name: player_guild,
			},
		];
	}

	// chart configs
	const axisOptions = {
		xAxisMode: "tick",
	};
	const lineOptions = {
		spline: 0,
		regionFill: 1,
	};

	let data = {
		labels: [],
		datasets: [],
		yMarkers: [
			{
				label: "",
				value: 5,
			},
			{
				label: "",
				value: 0,
			},
		],
	};

	// grid config
	let items = [];
	const columns = [
		{
			name: "Name",
			width: "40%",
		},
		{
			name: "Kills",
		},
		{
			name: "Deaths",
		},
		{
			id: "kd",
			name: "K/D",
		},
		{
			id: "joined",
			name: "Joined NWs",
		},
	];

	let kill_count = 0;
	let death_count = 0;
	let avg_kill_count = 0;
	let avg_death_count = 0;
	let avg_kd = 0;
	let player_count = 0;

	function get_kill_count() {
		return War.get_total_kills_guilds(guild_name, selected_wars);
	}
	function get_death_count() {
		return War.get_total_deaths_guilds(guild_name, selected_wars);
	}

	function get_avg_kills() {
		return War.get_avg_player_kills_guilds(guild_name, selected_wars).toFixed(2);
	}
	function get_avg_deaths() {
		return War.get_avg_player_deaths_guilds(guild_name, selected_wars).toFixed(2);
	}
	function get_avg_kd() {
		return War.get_avg_kd_guilds(guild_name, selected_wars).toFixed(2);
	}

	function get_player_count() {
		return War.get_unique_players_guilds(guild_name, selected_wars).size;
	}

	function open_player(event: CustomEvent) {
		const name = event.detail[1]._cells[0].data;

		navigate(`${guild_name}/${name}`, { replace: false });
	}

	/** takes screenshot of table and saves it to the clipboard*/
	function export_table() {
		html2canvas(document.querySelector(".gridjs-table"), { imageTimeout: 0, scrollY: 0 }).then((canvas) => {
			canvas.toBlob(function (blob) {
				const item = new ClipboardItem({ "image/png": blob });
				navigator.clipboard.write([item]);
			});
		});
	}
</script>

<h1>Global</h1>
<div class="container_wrapper">
	<div class="container grid">
		<Grid bind:data={items} {columns} sort={true} fixedHeader={true} on:rowClick={open_player} />
		<button type="button" class="button" style="margin-top:5px" on:click={export_table}>Save to clipboard</button>
	</div>
	<div class="container guild_detail">
		<h2>{guild_name}</h2>
		<table>
			<tr>
				<td>Kills</td>
				<td>{kill_count}</td>
			</tr>
			<tr>
				<td>Deaths</td>
				<td>{death_count}</td>
			</tr>
			<tr>
				<td>Avg. Kills</td>
				<td>{avg_kill_count}</td>
			</tr>
			<tr>
				<td>Avg. Deaths</td>
				<td>{avg_death_count}</td>
			</tr>
			<tr>
				<td>K/D</td>
				<td>{avg_kd}</td>
			</tr>
			<tr>
				<td>Player count</td>
				<td>{player_count}</td>
			</tr>
		</table>
		<CheckboxGroup class="war_selector" items={checkbox_data} name="wars[]" on:change={on_checkbox_change} />
	</div>
</div>

<!-- <div class="chart_container">
     <Chart {data} {axisOptions} {lineOptions} type="line" />
     </div> -->
<style>
	:global(.war_selector) {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 20px;
		width: 50%;
	}
	:global(.gridjs-table td:nth-child(5):after) {
		content: "%";
		color: white;
	}

	.guild_detail table {
		border: 0.125em dashed var(--primary-color);
		border-radius: 1.5625em;
		padding: 15px;
	}

	.grid {
		margin-top: 2rem;
	}

	table {
		text-align: left;
		width: 50%;
		color: white;
	}
	.container_wrapper {
		display: flex;
	}
	.container {
		width: 50%;
	}
</style>
