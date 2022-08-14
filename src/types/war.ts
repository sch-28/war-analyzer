import { convert_time_to_date } from "../util";
import { BDO_Log } from "./log";
import { Player } from "./player";

export class War {
	name: string;
	guilds: Guild[];
	logs: BDO_Log[];

	constructor(name: string, logs: BDO_Log[]) {
		this.name = name.split(".log")[0];
		this.logs = logs.map(log => new BDO_Log(log.player_one, log.player_two, log.kill, log.guild, log.time));
		this.guilds = [];
		this.parse_logs();
	}

	/**
	 * Parse logs into guilds with players
	 */
	parse_logs() {
		for (let log of this.logs) {
			let guild = this.guilds.find((g) => g.name == "Guild");
			if (!guild) {
				guild = new Guild("Guild");
				this.guilds.push(guild);
			}

			let ally = guild.players.find((p) => p.name == log.player_one);
			if (!ally) {
				ally = new Player(log.player_one, "Guild");
				guild.players.push(ally);
			}

			if (log.kill) ally.kills.push(log);
			else ally.deaths.push(log);

			guild = this.guilds.find((g) => g.name == log.guild);
			if (!guild) {
				guild = new Guild(log.guild);
				this.guilds.push(guild);
			}

			let enemy = guild.players.find((p) => p.name == log.player_two);
			if (!enemy) {
				enemy = new Player(log.player_two, log.guild);
				guild.players.push(enemy);
			}

			if (log.kill) enemy.deaths.push(log);
			else enemy.kills.push(log);
		}
	}

	get player_count() {
		return this.guilds.reduce((sum, guild) => sum + guild.players.length, 0);
	}

	get start_time() {
		return this.logs[0].time;
	}

	get end_time() {
		return this.logs[this.logs.length - 1].time;
	}

	get duration() {

		const start_time = convert_time_to_date(this.start_time);
		const end_time = convert_time_to_date(this.end_time);

		return +end_time - +start_time;

	}

	get parsed_start_time() {
		return this.start_time.split(":").slice(0, 2).join(":");
	}
	get parsed_end_time() {
		return this.end_time.split(":").slice(0, 2).join(":");
	}

	get_guild(name: string) {
		return this.guilds.find(g => g.name == name)
	}

	get_player(name: string) {
		const players = this.guilds.flatMap(guild => guild.get_player(name) ? [guild.get_player(name)] : [])
		if (players.length == 0) return undefined;

		return players[0]
	}


	static get_guild_stats(guild_name: string, wars: War[]) {
		return wars.flatMap(war => war.get_guild(guild_name) ? [war.get_guild(guild_name)] : [])
	}

	static get_total_player_count_guilds(guild_name: string, wars: War[]) {
		return this.get_guild_stats(guild_name, wars).reduce((sum, guild) => sum + guild.players.length, 0);
	}

	static get_total_kills_guilds(guild_name: string, wars: War[]) {
		const guild_stats = this.get_guild_stats(guild_name, wars)
		return guild_stats.reduce((sum, stat) => sum + stat.kill_count, 0)
	}

	static get_total_deaths_guilds(guild_name: string, wars: War[]) {
		const guild_stats = this.get_guild_stats(guild_name, wars)
		return guild_stats.reduce((sum, stat) => sum + stat.death_count, 0)
	}

	static get_avg_kills_guilds(guild_name: string, wars: War[]) {
		const guild_stats = this.get_guild_stats(guild_name, wars)
		if (guild_stats.length == 0) return 0;
		return this.get_total_kills_guilds(guild_name, wars) / guild_stats.length
	}

	static get_avg_deaths_guilds(guild_name: string, wars: War[]) {
		const guild_stats = this.get_guild_stats(guild_name, wars)
		if (guild_stats.length == 0) return 0;
		return this.get_total_deaths_guilds(guild_name, wars) / guild_stats.length
	}

	static get_avg_player_kills_guilds(guild_name: string, wars: War[]) {
		const player_count = this.get_total_player_count_guilds(guild_name, wars);
		const kills = this.get_total_kills_guilds(guild_name, wars);
		if (player_count == 0) return kills;

		return kills / player_count;
	}

	static get_avg_player_deaths_guilds(guild_name: string, wars: War[]) {
		const player_count = this.get_total_player_count_guilds(guild_name, wars);
		const deaths = this.get_total_deaths_guilds(guild_name, wars);
		if (player_count == 0) return deaths;

		return deaths / player_count;
	}

	static get_avg_kd_guilds(guild_name: string, wars: War[]) {
		const kills = this.get_total_kills_guilds(guild_name, wars)
		const deaths = this.get_total_deaths_guilds(guild_name, wars)
		if (deaths == 0) return kills;
		return kills / deaths
	}

	static get_unique_players_guilds(guild_name: string, wars: War[]) {
		const guild_stats = this.get_guild_stats(guild_name, wars)
		const players = new Set([]);
		guild_stats.forEach(guild => guild.players.forEach(player => players.add(player.name)))
		return players;
	}

	static get_player_stats(player_name: string, wars: War[]) {
		return wars.flatMap(war => war.get_player(player_name) ? [war.get_player(player_name)] : [])
	}

	static get_total_kills_players(player_name: string, wars: War[]) {
		const player_stats = this.get_player_stats(player_name, wars)
		return player_stats.reduce((sum, stat) => sum + stat.kill_count, 0)
	}

	static get_total_deaths_players(player_name: string, wars: War[]) {
		const player_stats = this.get_player_stats(player_name, wars)
		return player_stats.reduce((sum, stat) => sum + stat.death_count, 0)
	}

	static get_avg_kills_players(player_name: string, wars: War[]) {
		const player_stats = this.get_player_stats(player_name, wars)
		if (player_stats.length == 0) return 0;
		return this.get_total_kills_players(player_name, wars) / player_stats.length
	}

	static get_avg_deaths_players(player_name: string, wars: War[]) {
		const player_stats = this.get_player_stats(player_name, wars)
		if (player_stats.length == 0) return 0;
		return this.get_total_deaths_players(player_name, wars) / player_stats.length
	}

	static get_avg_kd_players(player_name: string, wars: War[]) {
		const kills = this.get_total_kills_players(player_name, wars)
		const deaths = this.get_total_deaths_players(player_name, wars)
		if (deaths == 0) return kills;
		return kills / deaths
	}

	static get_joined_wars_count(player_name: string, wars: War[]) {
		const player_stats = this.get_player_stats(player_name, wars)

		return player_stats.length;
	}

	static get_wars_count(guild_name: string, wars: War[]) {
		const war_stats = this.get_guild_stats(guild_name, wars)

		return war_stats.length;
	}

	static get_joined_wars_percentage(player_name: string, guild_name: string, wars: War[]) {
		const player_joined = this.get_joined_wars_count(player_name, wars);
		const guild_joined = this.get_wars_count(guild_name, wars);

		if (guild_joined == 0) return 0;

		return player_joined / guild_joined;
	}
}

export class Guild {
	name: string;
	players: Player[];

	constructor(name: string) {
		this.name = name;
		this.players = [];
	}

	get kd() {
		if (this.death_count == 0) return this.kill_count
		return this.kill_count / this.death_count
	}

	get avg_kill_count() {
		return this.kill_count / this.players.length
	}

	get avg_death_count() {
		return this.death_count / this.players.length
	}

	get kill_count() {
		return this.players.reduce((sum, player) => sum + player.kill_count, 0)
	}
	get death_count() {
		return this.players.reduce((sum, player) => sum + player.death_count, 0)
	}

	get logs() {
		return this.players.map(p => p.get_all_logs()).flat()
	}

	get_player(name: string) {
		return this.players.find(player => player.name == name);
	}
}
