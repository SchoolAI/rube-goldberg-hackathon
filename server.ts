import express from 'express';
import path from 'path';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
// import { searchWithLLM } from './search';
import { generateNewImage } from './generateImage';
import { searchWithLLM } from './search';
import { circleCoordinates } from './circleCoordinates';

const tmpDir = './.tmp';
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

const app = express();
const port = 3000;

const upload = multer({ dest: tmpDir }); // Store files in '.tmp' folder

app.use(express.static(path.join(__dirname, 'public')));

const uploadImageCloudflare = async (stream: any, name: string) => {
  const cloudflareUrl =
    'https://api.cloudflare.com/client/v4/accounts/c0919df946085842429c15f17dfc46ee/images/v1';
  const formData = new FormData();

  formData.append('file', stream, name);

  const response = await axios.post(cloudflareUrl, formData, {
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      ...formData.getHeaders(),
    },
  });

  if (response.status !== 200) {
    throw new Error(`Cloudflare API responded with status: ${response.status}`);
  }
  // console.log({ response });
  const url = response.data.result.variants[0];
  return url;
};

// Endpoint to handle the file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }
  const textInput = req.body.itemToFind; // Accessing text input from the form

  try {
    const cfUrl = await uploadImageCloudflare(
      fs.createReadStream(file.path),
      file.originalname
    );
    console.log({ cfUrl });

    const prompt = "Describe what's inside the yellow circle.";
    const imageDescription = (await searchWithLLM(prompt, cfUrl)) as string;

    //
    const newImage = await generateNewImage(
      `Generate what's inside the circle in this description: ${imageDescription}`
    );

    const maxAttempt = 10;
    let currAttempt = 0;
    let imgUrl = newImage;
    while (currAttempt < maxAttempt) {
      // const nextImageDescription = await searchWithLLM(
      //   'Find a small detail in this image that is interesting. Be very concise.',
      //   imgUrl as string
      // );
      // imgUrl = await generateNewImage(nextImageDescription as string);
      const filename = await circleCoordinates(
        Math.random(),
        Math.random(),
        imgUrl as string
      );

      const newCfUrl = await uploadImageCloudflare(
        fs.createReadStream(filename),
        `out-${currAttempt}.png`
      );

      const imageDescription = (await searchWithLLM(
        prompt,
        newCfUrl
      )) as string;

      //
      imgUrl = await generateNewImage(
        `Generate what's inside the circle in this description: ${imageDescription}`
      );
      // const llmResponse = await searchWithLLM(`Create a meme based on the following description: ${}`, nextImage);
      currAttempt++;
    }
    // const llmResponse = await searchWithLLM(textInput, url);

    // console.log('File uploaded to Cloudflare:', response.data);
    res.send(`Image generated: ${newImage}`);
  } catch (error) {
    console.error('Error uploading to Cloudflare:', error);
    res.status(500).send('Error uploading to Cloudflare');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
