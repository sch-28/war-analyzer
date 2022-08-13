<script lang="ts">
    import { navigate } from "svelte-routing";
    import Grid from "gridjs-svelte";
    import { wars } from "../store";
    import type { Guild, War } from "../types/war";
    import Chart from "svelte-frappe-charts";
    import type { Player } from "../types/player";
    import { convert_date_to_time, convert_time_to_date } from "../util";
    import { ArrowLeftIcon } from "svelte-feather-icons";

    export let war_name = "";

    let war: War;

    let data = {
        labels: [],

        yMarkers: [
            {
                label: "",
                value: 5,
            },
            {
                label: "",
                value: -5,
            },
        ],
        datasets: [{ values: [], name: "" }],
    };

    let selected_player: Player;

    let time_scale = 15;

    // refreshes selected war, when war_name prop is changed
    $: {
        war = $wars.find((w) => w.name == war_name);

        // if war is not found -> navigate to home
        if (!war) {
            setTimeout(() => navigate("/"), 1);
        } else {
            update_items(war.guilds[0]);
            update_graph();
        }
    }

    let items = [];
    let selected_guild: Guild;
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
    ];

    /**
    Shows the player stats for the given guild
  */
    function update_items(guild: Guild) {
        // get players
        const players = guild.players;
        selected_guild = guild;
        const result = [];

        // sort players by kills
        players.sort((a, b) => b.kill_count - a.kill_count);

        // create data for table
        for (let player of players) {
            result.push({
                name: player.name,
                kills: player.kill_count,
                deaths: player.death_count,
                kd: parseFloat(player.kill_death_ration.toFixed(2)),
            });
        }
        items = result;
        selected_player = players[0];
        update_graph();
    }

    let last_selection: HTMLTableRowElement;

    /** Click event on player row -> go to player page*/
    function open_player(event: CustomEvent) {
        const name = event.detail[1]._cells[0].data;
        const div = event.detail[0].path[1] as HTMLTableRowElement;
        if (last_selection)
            last_selection.childNodes.forEach((div: HTMLTableCellElement) =>
                div.classList.remove("selected_player")
            );
        div.childNodes.forEach((div: HTMLTableCellElement) =>
            div.classList.add("selected_player")
        );
        last_selection = div;
        selected_player = selected_guild.players.find((p) => p.name == name);
        update_graph();
    }

    function update_graph() {
        // create labels by dividing the duration by the time scale
        const time_intervals = Math.floor(war.duration / time_scale);
        const start_time = convert_time_to_date(war.start_time);
        const labels = [...Array(time_scale).keys()].map((i) =>
            convert_date_to_time(new Date(+start_time + time_intervals * i))
        );
        // add last logged time
        labels.push(war.end_time.split(":").slice(0, 2).join(":"));

        const guild_data = [];
        const player_data = [];
        // create guild data
        for (let i = 0; i < labels.length; i++) {
            if (i + 1 < labels.length) {
                // get all logs for that time
                let logs = selected_guild.logs.filter(
                    (log) => log.time >= labels[i] && log.time < labels[i + 1]
                );

                // normalize all logs
                logs = logs.map((log) =>
                    log.normalized_log(selected_guild.name)
                );

                // sort logs by time
                logs.sort((a, b) => (a.time < b.time ? -1 : 1));

                // calculate points
                let points =
                    logs.reduce((sum, log) => sum + (log.kill ? 1 : -1), 0) /
                    selected_guild.players.length;
                guild_data.push(points.toFixed(2));

                // a player is selected, do the same for it aswell
                if (selected_player) {
                    logs = logs.filter(
                        (log) => log.player_one == selected_player.name
                    );
                    points = logs.reduce(
                        (sum, log) => sum + (log.kill ? 1 : -1),
                        0
                    );

                    player_data.push(points);
                }
            }
        }

        data = {
            labels: labels,
            datasets: [
                {
                    values: guild_data,
                    name: selected_guild.name,
                },
                {
                    values: player_data,
                    name: selected_player ? selected_player.name : "",
                },
            ],
            yMarkers: [
                {
                    label: "",
                    value: 5,
                },
                {
                    label: "",
                    value: -5,
                },
            ],
        };
    }
    const axisOptions = {
        xAxisMode: "tick",
    };
    const lineOptions = {
        spline: 0,
        regionFill: 1,
    };

    function navigate_back() {
        navigate("/overview");
    }
</script>

<div on:click={navigate_back} class="back_button">
    <ArrowLeftIcon size="2x" />
</div>
{#if war}
    <h1>{war.name}</h1>
    <div class="container_wrapper">
        <div class="container">
            <div class="guild_select_container">
                <div class="guild_select">
                    {#each war.guilds as guild}
                        <button
                            type="button"
                            on:click={() => update_items(guild)}
                            class:selected={guild == selected_guild}
                            >{guild.name}</button
                        >
                    {/each}
                </div>
            </div>
            <Grid
                bind:data={items}
                {columns}
                sort={true}
                fixedHeader={true}
                on:rowClick={open_player}
            />
        </div>
        <div class="container guild_detail">
            <h2>{selected_guild.name}</h2>
            <table>
                <tr>
                    <td>Kills</td>
                    <td>{selected_guild.kill_count}</td>
                </tr>
                <tr>
                    <td>Deaths</td>
                    <td>{selected_guild.death_count}</td>
                </tr>
                <tr>
                    <td>Avg. Kills</td>
                    <td>{selected_guild.avg_kill_count.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Avg. Deaths</td>
                    <td>{selected_guild.avg_death_count.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>K/D</td>
                    <td>{selected_guild.kd.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Player count</td>
                    <td>{selected_guild.players.length}</td>
                </tr>
            </table>
            <div class="view_stats_container">
                <span>View global stats</span>
                <div class="buttons">
                    <button
                        on:click={() =>
                            navigate(`global/${selected_guild.name}`)}
                        >{selected_guild.name}</button
                    >
                    <button
                        on:click={() =>
                            navigate(
                                `global/${selected_guild.name}/${selected_player.name}`
                            )}
                        >{selected_player.name}
                    </button>
                </div>
            </div>
            <div class="chart_container">
                <span>{selected_guild.name} vs. {selected_player.name}</span>
                <Chart {data} {axisOptions} {lineOptions} type="line" />
            </div>
        </div>
    </div>
{/if}

<style global>
    .back_button {
        position: absolute;
        left: 16px;
        transform: translate(50%, 80%);
        cursor: pointer;
    }

    .view_stats_container {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .buttons {
        display: flex;
        gap: 5px;
    }

    .buttons button {
        width: 150px;
        background-color: transparent;
        color: white;
        border-radius: 0.75rem;
        border: var(--primary-color) 2px solid;
        transition: all 50ms;
        cursor: pointer;
    }

    .buttons button:hover {
        background-color: rgba(255, 255, 255, 0.07);
    }
    .buttons button:active {
        background-color: rgba(255, 255, 255, 0.07);
    }

    .chart_container {
        width: 100%;
        margin-top: auto;
    }
    :global(text) {
        fill: #bbbbbb;
    }
    :global(.line-horizontal.dashed) {
        display: none;
    }

    :global(.selected_player) {
        background-color: var(--primary-color) !important;
    }

    .guild_detail table {
        border: 0.125em dashed var(--primary-color);
        border-radius: 1.5625em;
        padding: 15px;
    }

    table {
        text-align: left;
        width: 50%;
        color: white;
    }
    .container_wrapper {
        display: flex;
    }
    .guild_detail {
        display: flex;
        position: relative;
        flex-direction: column;
        align-items: center;
    }
    .container {
        width: 50%;
    }
    .guild_select_container {
        border-top-right-radius: 8px;
        overflow: hidden;
        border-top-left-radius: 8px;
        margin-left: 10px;
        box-sizing: border-box;
        width: calc(100% - 15px);
    }
    .guild_select {
        display: flex;
        width: 100%;
        align-items: center;
        flex-wrap: nowrap;
        gap: 5px;
        overflow-x: auto;
    }

    .guild_select > button {
        height: 2rem;
        margin-bottom: 0;
        border-radius: 10px;
        width: 10rem;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        border-bottom: none;
        background-color: #2196f37d;
        color: white;
    }

    .guild_select > button.selected {
        background-color: #2196f3;
    }

    .gridjs-container {
        padding-top: 0;
    }
    .gridjs-wrapper {
        overflow-x: hidden;
        max-height: 700px;
        min-height: 700px;
    }

    .gridjs-tr > td {
        background-color: black;
        border: none;
    }

    .gridjs-tr:hover td {
        background-color: #2196f385;
        color: white;
        cursor: pointer;
    }
    .gridjs-tbody {
        background-color: transparent;
    }

    .gridjs-tr > th {
        background-color: rgb(33, 150, 243) !important ;
        color: white;
        border: none;
    }
</style>
