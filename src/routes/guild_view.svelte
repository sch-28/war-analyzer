<script lang="ts">
    export let guild_name = "";
    import { navigate } from "svelte-routing";
    import Chart from "svelte-frappe-charts";
    import Grid from "gridjs-svelte";
    import { wars } from "../store";

    import type { Player } from "../types/player";
    import type { Guild, War } from "../types/war";
    import { CheckboxGroup } from "attractions";

    export let player_guild = "";

    let all_wars: War[] = [];
    let guild_stats: Guild[] = [];
    let war_stats: War[] = [];
    let player_stats: { [name: string]: Player[] } = {};

    let checkbox_data = [];

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

        // get all selected wars
        const checked_checkboxes = checkbox_data
            .filter((ch) => ch.checked)
            .map((ch) => ch.value);
        const selected_wars = all_wars.filter((w) =>
            checked_checkboxes.includes(w.name)
        );

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
    function on_checkbox_change(
        e: CustomEvent<{ value: string; checked: boolean; nativeEvent: Event }>
    ) {
        checkbox_data = checkbox_data;
        update();
    }

    function update() {
        update_grid();
        update_chart();
    }

    function update_grid() {
        const results = [];
        for (let key of Object.keys(player_stats)) {
            const player = player_stats[key];

            // calculate avg kills for each player
            const avg_kills = +(
                player.reduce((sum, p) => sum + p.kill_count, 0) / player.length
            ).toFixed(2);

            // calculate avg deaths for each player
            const avg_deaths = +(
                player.reduce((sum, p) => sum + p.death_count, 0) /
                player.length
            ).toFixed(2);

            // calculate avg kd for each player
            const avg_kd = +(
                player.reduce((sum, p) => sum + p.kill_death_ration, 0) /
                player.length
            ).toFixed(2);

            // calculate % of wars joined
            const join_percentage = +(
                (player.length / guild_stats.length) *
                100
            ).toFixed(0);

            results.push({
                name: player[0].name,
                kills: avg_kills,
                deaths: avg_deaths,
                kd: avg_kd,
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

    function get_kill_count() {
        return guild_stats.reduce((sum, g) => sum + g.kill_count, 0);
    }
    function get_death_count() {
        return guild_stats.reduce((sum, g) => sum + g.death_count, 0);
    }
    function get_all_players() {
        return guild_stats.map((g) => g.players).flat();
    }

    function get_avg_kills() {
        return (get_kill_count() / get_all_players().length).toFixed(2);
    }
    function get_avg_deaths() {
        return (get_death_count() / get_all_players().length).toFixed(2);
    }
    function get_avg_kd() {
        if (get_death_count() == 0) return get_kill_count();
        return (get_kill_count() / get_death_count()).toFixed(2);
    }

    function get_player_count() {
        return Object.keys(player_stats).length;
    }

    function open_player(event: CustomEvent) {
        const name = event.detail[1]._cells[0].data;

        navigate(`${guild_name}/${name}`, { replace: false });
    }
</script>

<h1>Global</h1>
<div class="container_wrapper">
    <div class="container grid">
        <Grid
            bind:data={items}
            {columns}
            sort={true}
            fixedHeader={true}
            on:rowClick={open_player}
        />
    </div>
    <div class="container guild_detail">
        <h2>{guild_name}</h2>
        <table>
            <tr>
                <td>Kills</td>
                <td>{get_kill_count()}</td>
            </tr>
            <tr>
                <td>Deaths</td>
                <td>{get_death_count()}</td>
            </tr>
            <tr>
                <td>Avg. Kills</td>
                <td>{get_avg_kills()}</td>
            </tr>
            <tr>
                <td>Avg. Deaths</td>
                <td>{get_avg_deaths()}</td>
            </tr>
            <tr>
                <td>K/D</td>
                <td>{get_avg_kd()}</td>
            </tr>
            <tr>
                <td>Player count</td>
                <td>{get_player_count()}</td>
            </tr>
        </table>
        <CheckboxGroup
            class="war_selector"
            items={checkbox_data}
            name="wars[]"
            on:change={on_checkbox_change}
        />
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
