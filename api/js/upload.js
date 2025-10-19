import 'dotenv/config'
import {
    GoogleGenAI,
    createUserContent,
    createPartFromUri,
  } from "@google/genai";

const ai = new GoogleGenAI({});

const myfile = await ai.files.upload({
file: "ynab.mov",
config: { mimeType: "video/mov" },
});

console.log(myfile);