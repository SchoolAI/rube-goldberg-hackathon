import express from 'express';
import path from 'path';
import multer from 'multer';

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' }); // Temporarily store files in 'uploads' folder

app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to handle the file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  // TODO: Add logic to upload the file to Cloudflare Images
  console.log('File received:', file);

  // Dummy response for now
  res.send('File uploaded successfully');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
