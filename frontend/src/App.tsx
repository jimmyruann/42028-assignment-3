import React, { useEffect, useState } from "react";
import NavBarComponent from "./components/NavBar.component";
import { axiosInstance, socketIO } from "./api";

function App() {
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [fileName, setFileName] = useState("");
	const [fileUrl, setFileUrl] = useState("");
	const [fileType, setFileType] = useState("");

	const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files!);
		setSelectedFiles(files);
	};

	const handleClickUpload = (event: React.MouseEvent<HTMLButtonElement>) => {
		event?.preventDefault();

		const formData = new FormData();
		formData.append("uploaded_file", selectedFiles[0]);
		axiosInstance
			.post("/upload", formData, {
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
			<div className="container mx-auto mb-20">
				<div className="border-black mx-auto pt-5 max-w-2xl">
					<h1 className="text-2xl font-bold pb-5">How to use</h1>
					<p>
						Basically you just upload a video and our Crack Detector is going to tell you if there's a crack
						with your concrete in the video.
					</p>
					{fileUrl === "" ? (
						<>
							<div className="py-5 w-full">
								<label className="font-bold pr-5">Upload Video:</label>
								<input
									type="file"
									onChange={handleFileSelected}
									name="uploaded_file"
									accept="video/*"
								/>
								<button
									className={`float-right bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-5 rounded ${
										selectedFiles.length ? "block" : "hidden"
									}`}
									onClick={handleClickUpload}>
									Upload
								</button>
							</div>
						</>
					) : (
						<>
							<h1 className="text-2xl font-bold py-5">Original Video</h1>
							<video controls className="w-full">
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
	const [soMessage, setSoMessage] = useState("Not Started");
	const [outputUrl, setOutputUrl] = useState("");
	const [classifier, setClassifier] = useState("resNetModel");
	const [clicked, setClicked] = useState(false);
	const [finished, setFinished] = useState(false);

	const handleOnclick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setClicked(true);
		axiosInstance.post(`/process/${classifier}/${fileName}`).then((response) => {
			if (response.data.success) {
				console.log(response.data);
				setOutputUrl(response.data.output_url);
			}
		});
	};

	const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
		event.preventDefault();
		setClassifier(event.target.value);
	};

	useEffect(() => {
		socketIO.on("python", (message: string) => {
			console.log(message);
			setSoMessage(message);
			if (message === "Video Classification Finished") {
				setFinished(true);
			}
		});
	});

	function renderUnfinish() {
		return (
			<>
				<div className="my-5">
					<select
						className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						defaultValue={classifier}
						onChange={handleSelect}
						disabled={clicked}>
						<option value="resNetModel">ResNet50V2</option>
						<option value="inceptionV3">InceptionV3</option>
						<option value="vgg16Model">VGG16</option>
					</select>
					<button
						className={`${
							clicked ? "bg-gray-400" : "bg-blue-600"
						} hover:bg-blue-dark text-white font-bold py-2 px-4 rounded mt-2 w-full`}
						onClick={handleOnclick}
						disabled={clicked}>
						{clicked ? "Currently Processing Video" : "Process Video"}
					</button>
				</div>
				<div>
					<h1 className="text-2xl font-bold">Python Classifier: {classifier}</h1>
					<div>Current Status: {soMessage}</div>
				</div>
			</>
		);
	}

	function renderFinish() {
		return (
			<>
				<h1 className="text-2xl font-bold py-5">Processed Video - {classifier}</h1>
				<video controls className="w-full">
					<source src={outputUrl} type="video/mp4" />
				</video>
			</>
		);
	}

	return <>{finished ? renderFinish() : renderUnfinish()}</>;
};

export default App;
