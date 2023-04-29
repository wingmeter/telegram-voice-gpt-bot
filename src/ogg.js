import axios from "axios";

import ffmpeg from "fluent-ffmpeg";
import installer from "@ffmpeg-installer/ffmpeg";

import { createWriteStream } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import { removeFile } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

class OggConverter {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path);
  }

  toMp3(oggPath, userId) {
    try {
      const outputPath = resolve(dirname(oggPath), `${userId}.mp3`);
      return new Promise((resolve, reject) => {
        ffmpeg(oggPath)
          .inputOption("-t 30")
          .output(outputPath)
          .on("end", () => {
            removeFile(oggPath);
            resolve(outputPath);
          })
          .on("error", (err) => reject(err.message))
          .run();
      });
    } catch (e) {
      console.log(`Error while toMP3`, e.message);
    }
  }

  async create({ linkHref, userId }) {
    try {
      const oggPath = resolve(__dirname, "../voices", `${userId}.ogg`);
      const response = await axios({
        method: "get",
        url: linkHref,
        responseType: "stream",
      });
      return new Promise((resolve) => {
        const stream = createWriteStream(oggPath);
        response.data.pipe(stream);
        stream.on("finish", () => resolve(oggPath));
      });
    } catch (error) {
      console.log(`Error while get and create`, error.message);
    }
  }
}

export const ogg = new OggConverter();
