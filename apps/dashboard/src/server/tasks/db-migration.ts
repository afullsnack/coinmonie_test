import { defineTask } from "nitro/task";


export default defineTask({
	meta: {
		name: "db:migration:sqlite",
		description: "Push migration files to sqlite (turso) db"
	},
	async run() {
		// Run db migration function

		return {result: "Success"}
	}
})
