import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import NavBarComponent from "./components/NavBar.component";

function App() {
	const [fileName, setFileName] = useState("");
	const [fileUrl, setFileUrl] = useState("");
	const [fileType, setFileType] = useState("");

	const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files!);

		var formData = new FormData();
		formData.append("uploaded_file", files[0]);

		axios
			.post("http://localhost:3001/api/upload", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})
			.then((response) => {
				setFileUrl(response.data.url);
				setFileType(response.data.type);
				setFileName(response.data.file_name);
			});
	};

	return (
		<>
			<NavBarComponent />
			<div className="container mx-auto">
				<div
					className="border-black mx-auto pt-5"
					style={{
						width: "40em",
					}}>
					<h1 className="text-2xl font-bold">How to use</h1>
					<br />
					<p>
						Basically you just upload a video and our Crack Detector is going to tell you if there's a crack
						with your concrete in the video.
					</p>
					{fileUrl === "" ? (
						<>
							<div className=" inline-block py-5">
								<label className="font-bold pr-5">Upload Video:</label>
								<input type="file" onChange={handleFileSelected} name="uploaded_file" className="" />
							</div>
						</>
					) : (
						<>
							<video controls className="w-full pt-5">
								<source src={fileUrl} type={fileType} />
							</video>
							<PythonComponent fileName={fileName} />
						</>
					)}
				</div>
			</div>
		</>
	);
}

const PythonComponent = ({ fileName }: { fileName: string }) => {
	const [clicked, setClicked] = useState(false);
	const [soMessages, setSoMessages] = useState<string[]>([]);

	const handleOnclick = (event: any) => {
		setClicked(true);
		axios.post(`http://localhost:3001/api/process/${fileName}`).then((response) => {
			if (response.data.success) {
				// Start websocket
				// setSoUrl("ws://localhost:3001");
				console.log("Start");
			}
		});
	};

	const socket = io("ws://localhost:3001");

	useEffect(() => {
		socket.on("python", (message: string) => {
			setSoMessages([...soMessages, `${new Date().toISOString()} - ${message}`]);
		});
	}, [soMessages, socket]);

	return (
		<div>
			<button
				className={`${
					clicked ? "bg-gray-400" : "bg-blue-600"
				} hover:bg-blue-dark text-white font-bold py-2 px-4 rounded my-5 w-full`}
				onClick={handleOnclick}
				disabled={clicked}>
				{clicked ? "Currently Processing Video" : "Process Video"}
			</button>
			<h1 className="text-2xl font-bold">Python Output</h1>
			<div className="border border-solid border-black w-full my-5 p-3 overflow-scroll" style={{ height: 300 }}>
				{soMessages.map((message: string, i: number) => {
					return (
						<span className="w-full block" key={i}>
							{message}
						</span>
					);
				})}
			</div>
		</div>
	);
};

export default App;
