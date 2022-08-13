<script lang="ts">
    import { navigate, Link } from "svelte-routing";
    import Chart from "svelte-frappe-charts";
    import Trend from "../components/trend.svelte";

    import { wars } from "../store";

    import type { Player } from "../types/player";
    import type { Guild, War } from "../types/war";

    export let player_name = "";
    export let player_guild = "";

    let player_stats: Player[] = [];
    let guild_stats: Guild[] = [];
    let war_stats: War[] = [];

    // refreshes selected player, when player_name
    $: {
        player_stats = [];
        guild_stats = [];
        war_stats = [];
        for (let war of $wars) {
            for (let guild of war.guilds) {
                if (guild.name == player_guild) {
                    guild_stats.push(guild);
                    war_stats.push(war);
                    for (let player of guild.players) {
                        if (player.name == player_name) {
                            player_stats.push(player);
                        }
                    }
                }
            }
        }

        // if player not found -> navigate home
        if (player_stats.length == 0) {
            setTimeout(() => navigate("/"), 1);
        } else {
            update_chart();
        }
    }

    function update_chart() {
        const labels = war_stats.map((war) => war.name);

        const guild_data = guild_stats.map((guild) => +guild.kd.toFixed(2));
        const player_data = player_stats.map(
            (player) => +player.kill_death_ration.toFixed(2)
        );

        data.labels = labels;
        data.datasets = [
            {
                values: guild_data,
                name: player_guild,
            },
            {
                values: player_data,
                name: player_name,
            },
        ];
    }

    function get_total_kills() {
        return player_stats.reduce((sum, player) => sum + player.kill_count, 0);
    }
    function get_total_deaths() {
        return player_stats.reduce(
            (sum, player) => sum + player.death_count,
            0
        );
    }

    function get_avg_kills() {
        return (get_total_kills() / player_stats.length).toFixed(2);
    }
    function get_avg_deaths() {
        return (get_total_deaths() / player_stats.length).toFixed(2);
    }
    function get_kd() {
        if (get_total_deaths() == 0) return get_total_kills();
        return (get_total_kills() / get_total_deaths()).toFixed(2);
    }

    function get_joined_percentage() {
        return ((player_stats.length / $wars.length) * 100).toFixed(0);
    }

    function kill_diff() {
        const guild_player_amount = guild_stats.reduce(
            (sum, g) => g.players.length + sum,
            0
        );
        const guild_avg_kills =
            guild_stats.reduce((sum, g) => sum + g.kill_count, 0) /
            guild_player_amount;

        const player_avg_kills = get_total_kills() / player_stats.length;

        return +(player_avg_kills - guild_avg_kills).toFixed(2);
    }

    function death_diff() {
        const guild_player_amount = guild_stats.reduce(
            (sum, g) => g.players.length + sum,
            0
        );

        const guild_avg_deaths =
            guild_stats.reduce((sum, g) => sum + g.death_count, 0) /
            guild_player_amount;

        const player_avg_deaths = get_total_deaths() / player_stats.length;

        return +(player_avg_deaths - guild_avg_deaths).toFixed(2);
    }

    function has_higher_kd() {
        const guild_kd =
            guild_stats.reduce((sum, g) => sum + g.kd, 0) /
            guild_stats[0].players.length;

        const player_kd = player_stats.reduce(
            (sum, p) => p.kill_death_ration,
            0
        );

        return +(player_kd - guild_kd).toFixed(2);
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
</script>

{#if player_stats.length > 0}
    <h1>
        {player_name} of <Link to={`/global/${player_guild}`}
            >{player_guild}</Link
        >
    </h1>
    <table class="stats">
        <tr>
            <td>Kills</td>
            <td />
            <td>{get_total_kills()}</td>
        </tr>
        <tr>
            <td>Deaths</td>
            <td />
            <td>{get_total_deaths()}</td>
        </tr>
        <tr>
            <td>Avg. Kills</td>
            <td class="trend_td"><Trend value={kill_diff()} /></td>
            <td class:higher={kill_diff() > 0} class:lower={kill_diff() < 0}
                >{get_avg_kills()}</td
            >
        </tr>
        <tr>
            <td>Avg. Deaths</td>
            <td class="trend_td"><Trend value={death_diff()} /></td>
            <td class:higher={death_diff() < 0} class:lower={death_diff() > 0}
                >{get_avg_deaths()}</td
            >
        </tr>
        <tr>
            <td>K/D</td>
            <td class="trend_td"><Trend value={has_higher_kd()} /></td>
            <td
                class:higher={has_higher_kd() > 0}
                class:lower={has_higher_kd() < 0}>{get_kd()}</td
            >
        </tr>
        <tr>
            <td>joined wars</td>
            <td />
            <td
                >{player_stats.length}/{$wars.length} ({get_joined_percentage()}%)</td
            >
        </tr>
    </table>
    <div class="chart_container">
        <span>{player_guild} K/D vs. {player_name} K/D</span>
        <Chart {data} {axisOptions} {lineOptions} type="line" />
    </div>
{/if}

<style>
    .stats {
        left: 50%;
        transform: translateX(-50%);
        position: absolute;
        text-align: left;
        width: 20%;
        color: white;
        border: 0.125em dashed var(--primary-color);
        border-radius: 1.5625em;
        padding: 15px;
        border-collapse: separate;
        border-spacing: 5px;
    }

    .stats .trend_td {
        width: 1%;
        white-space: nowrap;
    }

    .stats .higher {
        color: #59d15e;
    }
    .stats .lower {
        color: red;
    }

    .chart_container {
        width: 75%;
        position: absolute;
        left: 50%;
        top: 40%;
        transform: translateX(-50%);
    }
</style>
