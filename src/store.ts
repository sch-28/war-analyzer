import { writable } from "svelte/store";
import type { BDO_Log } from "./types/log";
import type { Player } from "./types/player";
import { War } from "./types/war";

let l_guilds: { [key: string]: Player[] } = { Guild: [] };
let l_logs: BDO_Log[] = [];


// const dev_war = new War("dev_war", dev_json.logs);

let l_wars: War[] = [];

export const wars = writable(l_wars);
export const logs = writable(l_logs);
