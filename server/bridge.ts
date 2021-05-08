import so from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Options, PythonShell } from "python-shell";
import path from "path";

export async function bridge(io: so.Server<DefaultEventsMap, DefaultEventsMap>, fileDir: string, classifier: string) {
	const options: Options = process.env.PYTHON_PATH
		? {
				pythonPath: process.env.PYTHON_PATH,
				mode: "text",
				pythonOptions: ["-u"],
				scriptPath: path.join(process.cwd(), "/cnn"),
				args: [
					"-m",
					path.join(process.cwd(), "/cnn/models", `${classifier}.h5`),
					"-i",
					path.join(process.cwd(), "/cnn/input", fileDir),
					"-o",
					path.join(process.cwd(), "/cnn/output", fileDir),
				],
		  }
		: {
				mode: "text",
				pythonOptions: ["-u"],
				scriptPath: path.join(process.cwd(), "/cnn"),
				args: [
					"-m",
					path.join(process.cwd(), "/cnn/models", `${classifier}.h5`),
					"-i",
					path.join(process.cwd(), "/cnn/input", fileDir),
					"-o",
					path.join(process.cwd(), "/cnn/output", fileDir),
				],
		  };

	const pyshell = new PythonShell("run_classification.py", options);

	pyshell.on("message", function (message) {
		io.emit("python", message);
	});

	pyshell.end(function (err, code, signal) {
		if (err) {
			io.emit("python", `Something went wrong. Error Message: ${err.message}`);
		}
		io.emit("python", "Video Classification Finished");
	});
}
