import express, { Application, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import so from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { bridge } from "./bridge";

let io: so.Server<DefaultEventsMap, DefaultEventsMap>;

const router = express.Router();
const storage = multer.diskStorage({
	destination(req, file, cb) {
		cb(null, path.join(__dirname, "uploads"));
	},
	filename(req, file, cb) {
		const { originalname } = file;
		const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0];
		cb(null, `${originalname}__${Date.now()}${fileExtension}`);
	},
});
const upload = multer({ dest: path.join(process.cwd(), "uploads"), storage });

router.get("/", (req: Request, res: Response) => {
	return res.send("This is api backend");
});

router.post("/upload", upload.single("uploaded_file"), (req: Request, res: Response) => {
	return res.status(200).json({
		success: true,
		file_name: req.file.filename,
		url: `${req.protocol + "://" + req.get("host")}/api/files/${req.file.filename}`,
		type: req.file.mimetype,
	});
});

router.get("/files/:file_name", (req: Request, res: Response) => {
	const { file_name } = req.params;

	const upload_dir = path.join(__dirname, "uploads");
	const file_dir = path.join(upload_dir, file_name);

	if (fs.existsSync(file_dir)) {
		return res.sendFile(file_dir);
	} else {
		return res.status(404).send("Not Found");
	}
});

router.post("/process/:file_name", (req: Request, res: Response) => {
	const { file_name } = req.params;
	const upload_dir = path.join(__dirname, "uploads");
	const file_dir = path.join(upload_dir, file_name);

	if (fs.existsSync(file_dir)) {
		// Set up a bridge between python model and nodejs
		// console.log(io)
		bridge(io, file_dir);
		return res.json({
			success: true,
		});
	} else {
		return res.status(404).json({
			success: false,
			message: "File not found.",
		});
	}
});

export default {
	r(ioServer: so.Server<DefaultEventsMap, DefaultEventsMap>) {
		io = ioServer;
		return router;
	},
};
