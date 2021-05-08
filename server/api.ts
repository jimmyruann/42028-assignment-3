import express, { Application, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import so from "socket.io";
import crypto from "crypto-js";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { bridge } from "./bridge";

let io: so.Server<DefaultEventsMap, DefaultEventsMap>;

const UPLOAD_DIR = `${process.cwd()}/cnn/input`;
const OUTPUT_DIR = `${process.cwd()}/cnn/output`;

const router = express.Router();
const upload = multer({
	dest: UPLOAD_DIR,
	storage: multer.diskStorage({
		destination(req, file, cb) {
			cb(null, UPLOAD_DIR);
		},
		filename(req, file, cb) {
			const { originalname } = file;
			const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0];
			cb(null, `${crypto.MD5(`${originalname}__${Date.now()}`)}${fileExtension}`);
		},
	}),
});

router.get("/", (req: Request, res: Response) => {
	return res.send("This is api backend");
});

router.post("/upload", upload.single("uploaded_file"), (req: Request, res: Response) => {
	return res.status(200).json({
		success: true,
		file_name: req.file.filename,
		url: `${req.protocol + "://" + req.get("host")}/api/files/input/${req.file.filename}`,
		type: req.file.mimetype,
	});
});

// type: ["input", "output"]
router.get("/files/:type/:file_name", (req: Request, res: Response) => {
	const { type, file_name } = req.params;

	const dir = type === "input" ? UPLOAD_DIR : OUTPUT_DIR;
	const file_dir = path.join(dir, file_name);

	if (fs.existsSync(file_dir)) {
		return res.sendFile(file_dir);
	} else {
		return res.status(404).send("Not Found");
	}
});

// classifier: ["inceptionV3", "resNetModel", "vgg16Model"]
router.post("/process/:classifier/:file_name", (req: Request, res: Response) => {
	const { classifier, file_name } = req.params;
	const file_dir = path.join(UPLOAD_DIR, file_name);

	if (fs.existsSync(file_dir)) {
		// Set up a bridge between python model and nodejs
		if (["inceptionV3", "resNetModel", "vgg16Model"].includes(classifier)) {
			bridge(io, file_name, classifier);
			return res.json({
				success: true,
				output_url: `/api/files/output/${file_name}`,
			});
		} else {
			return res.status(404).json({
				success: false,
				classifier: classifier,
				message: "Bad Classifier",
			});
		}
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
