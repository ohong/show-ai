import 'dotenv/config'
import {
    GoogleGenAI,
    createUserContent,
    createPartFromUri,
  } from "@google/genai";
  import { readFile } from 'fs/promises';

const ai = new GoogleGenAI({});

async function main() {
  const data = await readFile('system_prompt.md', 'utf8');
  // const myfile = await ai.files.upload({
  //   file: "kids_s.mov",
  //   config: { mimeType: "video/mov" },
  // });

  // console.log(myfile);

  // const response = await ai.models.generateContent({
  //   model: "gemini-2.5-flash",
  //   contents: createUserContent([
  //     createPartFromUri("https://generativelanguage.googleapis.com/v1beta/files/8rc2y31pvi10", "video/mov"),
  //     "Summarize this video. Then create a quiz with an answer key based on the information in this video.",
  //   ]),
  // });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: "https://generativelanguage.googleapis.com/v1beta/files/j5qjx2fs2yav",
              mimeType: "video/mov",
            },
            videoMetadata: {
              fps: 10, // Custom frame sampling rate (frames per second)
            },
          },
          {
            text: data,
          },
        ],
      },
    ],
  });
  console.log(response.text);
}

await main();
