window.onload = () => {
  const form = document.getElementById('uploadForm') as HTMLFormElement;
  form.onsubmit = async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById(
      'pictureUpload'
    ) as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      alert('Please select an image file.');
      return;
    }

    const base64 = await toBase64(file);
    // Replace this with your actual function that takes the base64 string
    yourFunction(base64);
  };
};

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

async function yourFunction(base64: string) {
  // Your function implementation here
  console.log(base64);
}
