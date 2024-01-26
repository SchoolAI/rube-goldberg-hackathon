import axios from 'axios';
import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const generateNewImage = async (prompt: string) => {
  console.log('generating image', prompt);
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    });
    const url = response.data[0].url;

    // Save the image
    const imageResponse = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
    });

    const path = './images/' + new Date().getTime() + '.png'; // Save with a timestamp to avoid overwriting
    const writer = fs.createWriteStream(path);

    imageResponse.data.pipe(writer);

    return url;
  } catch (e) {
    console.log(e);
  }
};
