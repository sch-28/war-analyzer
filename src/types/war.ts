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
}
