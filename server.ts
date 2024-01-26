import express from 'express';
import path from 'path';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { searchWithLLM } from './searchWithLLM';

const tmpDir = './.tmp';
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

const app = express();
const port = 3000;

const upload = multer({ dest: tmpDir }); // Store files in '.tmp' folder

app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to handle the file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }
  const textInput = req.body.itemToFind; // Accessing text input from the form

  try {
    const cloudflareUrl =
      'https://api.cloudflare.com/client/v4/accounts/c0919df946085842429c15f17dfc46ee/images/v1';
    const formData = new FormData();

    formData.append('file', fs.createReadStream(file.path), file.originalname);

    const response = await axios.post(cloudflareUrl, formData, {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        ...formData.getHeaders(),
      },
    });

    if (response.status !== 200) {
      throw new Error(
        `Cloudflare API responded with status: ${response.status}`
      );
    }

    const url = response.data.result.variants[0];
    const llmResponse = await searchWithLLM(textInput, url);

    console.log('File uploaded to Cloudflare:', response.data);
    res.send('File uploaded successfully to Cloudflare');
  } catch (error) {
    console.error('Error uploading to Cloudflare:', error);
    res.status(500).send('Error uploading to Cloudflare');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
