import so from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { PythonShell } from "python-shell";
import path from "path";

let pyshell = new PythonShell(path.join(process.cwd(), "/cnn/run_classification.py"));

export async function bridge(io: so.Server<DefaultEventsMap, DefaultEventsMap>, fileDir: string) {
	pyshell.send("hello");

	pyshell.on("message", function (message) {
		// received a message sent from the Python script (a simple "print" statement)
		io.emit("python", message);
	});

	pyshell.end(function (err, code, signal) {
		if (err) throw err;
		console.log("The exit code was: " + code);
		console.log("The exit signal was: " + signal);
		console.log("finished");
	});

	// await delay(1000);
	// io.emit("python", "Start CNN server");
	// await delay(2000);
	// io.emit("python", "Preprocessing video frames");
	// await delay(2000);
	// io.emit("python", "Doing dodgy shit");
	// await delay(5000);
	// io.emit("python", "Doing dodgy shit again");
}

const delay = (ms: any) => new Promise((res) => setTimeout(res, ms));
