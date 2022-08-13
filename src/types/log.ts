export class BDO_Log {
	player_one: string;
	player_two: string;
	kill: boolean;
	guild: string;
	time: string;

	constructor(p1: string, p2: string, kill: boolean, guild: string, time: string) {
		this.player_one = p1;
		this.player_two = p2;
		this.kill = kill;
		this.guild = guild;
		if (this.guild == "-1") {
			this.guild = "No Guild"
		}
		this.time = time;
	}


	static parse_log(log: string) {
		const regex = /\[(.*)\] (\w*) (died to|has killed) (\w*) from (\w*)/;
		const results = log.match(regex);
		const kill = results[3] == "has killed"
		return new BDO_Log(results[2], results[4], kill, results[5], results[1])
	}

	normalized_log(guild: string) {
		if (guild == this.guild) {
			return new BDO_Log(this.player_two, this.player_one, !this.kill, "Guild", this.time)
		}
		return this;
	}
}
