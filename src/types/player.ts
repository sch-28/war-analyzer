import type { BDO_Log } from "./log";
import type { War } from "./war";

export class Player {
	name: string;
	guild: string;
	kills: BDO_Log[];
	deaths: BDO_Log[];
	constructor(name: string, guild: string) {
		this.name = name;
		this.guild = guild;

		this.kills = [];
		this.deaths = [];
	}

	get death_count() {
		return this.deaths.length;
	}
	get kill_count() {
		return this.kills.length;
	}
	get kill_death_ration() {
		if (this.death_count == 0) return this.kill_count;
		return this.kill_count / this.death_count;
	}

	get time_joined() {
		const logs = this.get_all_logs();
		if (logs.length > 0) {
			return [logs[0].time, logs[logs.length - 1].time];
		}

		return 0;
	}

	get time_joined_parsed() {
		const times = this.time_joined;
		if (times == 0) return times;

		const start_time = times[0].split(":");
		const end_time = times[1].split(":");

		return `${start_time[0]}:${start_time[1]} - ${end_time[0]}:${end_time[1]}`;
	}

	get_all_logs() {
		return [...this.deaths, ...this.kills].sort((a, b) => (a.time < b.time ? -1 : 1));
	}

	get highest_killstreak() {
		const logs = this.get_all_logs();

		let killstreak = 0;
		let highest_killstreak = 0;
		for (let log of logs) {
			killstreak = log.kill ? killstreak + 1 : 0;
			if (killstreak > highest_killstreak) {
				highest_killstreak = killstreak;
			}
		}

		return highest_killstreak;
	}

}
