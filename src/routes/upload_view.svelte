<script lang="ts">
	import { FileDropzone, SnackbarContainer } from "attractions";
	import { BDO_Log } from "../types/log";
	import { wars } from "../store";
	import { navigate } from "svelte-routing";
	import { War } from "../types/war";

	function load_data(
		event: CustomEvent<{
			files: File[];
			nativeEvent?: Event;
		}>
	) {
		const promises: Promise<War>[] = [];
		for (let i = 0; i < event.detail.files.length; i++) {
			const file = event.detail.files[i];
			const promise = new Promise<War>((resolve, reject) => {
				let reader = new FileReader();
				reader.onload = function (e: ProgressEvent<FileReader>) {
					// const results = JSON.parse(
					// 						e.target.result as string
					// 					) as BDO_Log[];
					const content = this.result as string;
					const results = [
						...content.matchAll(
							/\[.*\] (\w*) (died to|has killed) (\w*) from (\w*)/g
						),
					];
					if (results.length > 0) {
						const logs = results.map((log) =>
							BDO_Log.parse_log(log[0])
						);
						const war = new War(file.name, logs);
						resolve(war);
					} else {
						reject();
					}
				};
				reader.onerror = reject;
				reader.readAsText(file);
			});

			promises.push(promise);
		}
		if (promises.length == 0) {
			show_error();
			return;
		}

		$wars = [];
		Promise.all(promises).then(
			(result) => {
				for (let war of result) {
					$wars.push(war);
				}
				navigate("/overview");
			},
			() => {
				show_error();
			}
		);
	}

	function show_error() {
		snackbar.showSnackbar({ props: { text: "Invalid JSON file" } });
		files = [];
	}

	let snackbar;
	let files;
</script>

<main>
	<h1>war analyzer</h1>
	<FileDropzone accept=".log" on:change={load_data} bind:files />
</main>

<SnackbarContainer bind:this={snackbar} />

<style>
	:global(.snackbar-stack) {
		position: absolute !important;
		bottom: 15px;
	}
	h1 {
		color: white;
	}
	main {
		position: absolute;
		top: 50%;
		right: 50%;
		transform: translate(50%, -50%);
	}
</style>
