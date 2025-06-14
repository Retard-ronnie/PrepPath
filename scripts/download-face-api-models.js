const fs = require('fs');
const path = require('path');
const axios = require('axios');

const modelsDir = path.join(__dirname, '../public/models');

// Ensure the models directory exists
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// The model files we need to download
const modelFiles = [
  // Tiny Face Detector
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1',
    path: path.join(modelsDir, 'tiny_face_detector', 'tiny_face_detector_model-shard1')
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json',
    path: path.join(modelsDir, 'tiny_face_detector', 'tiny_face_detector_model-weights_manifest.json')
  },
  
  // Face Landmark Detection
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1',
    path: path.join(modelsDir, 'face_landmark_68', 'face_landmark_68_model-shard1')
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json',
    path: path.join(modelsDir, 'face_landmark_68', 'face_landmark_68_model-weights_manifest.json')
  }
];

// Function to download a file
async function downloadFile(url, filePath) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    console.log(`Downloading ${url} to ${filePath}...`);
    
    // Download file
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });
    
    // Save file
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading ${url}:`, error.message);
    throw error;
  }
}

// Download all model files
async function downloadAllModels() {
  console.log('Starting download of face-api.js model files...');
  
  for (const file of modelFiles) {
    try {
      await downloadFile(file.url, file.path);
      console.log(`Downloaded ${file.path} successfully.`);
    } catch (error) {
      console.error(`Failed to download ${file.path}.`);
    }
  }
  
  console.log('All downloads completed.');
}

// Run the download
downloadAllModels();
