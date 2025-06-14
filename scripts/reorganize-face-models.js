const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../public/models');
const tinyFaceDetectorDir = path.join(modelsDir, 'tiny_face_detector');
const faceLandmarksDir = path.join(modelsDir, 'face_landmark_68');

// Check if the directories exist
if (!fs.existsSync(modelsDir)) {
  console.error('Models directory does not exist!');
  process.exit(1);
}

if (!fs.existsSync(tinyFaceDetectorDir) || !fs.existsSync(faceLandmarksDir)) {
  console.error('Model subdirectories are missing!');
  process.exit(1);
}

// Move files from subdirectories to the main models directory
try {
  // Tiny Face Detector
  fs.copyFileSync(
    path.join(tinyFaceDetectorDir, 'tiny_face_detector_model-shard1'),
    path.join(modelsDir, 'tiny_face_detector_model-shard1')
  );
  fs.copyFileSync(
    path.join(tinyFaceDetectorDir, 'tiny_face_detector_model-weights_manifest.json'),
    path.join(modelsDir, 'tiny_face_detector_model-weights_manifest.json')
  );
  
  // Face Landmarks
  fs.copyFileSync(
    path.join(faceLandmarksDir, 'face_landmark_68_model-shard1'),
    path.join(modelsDir, 'face_landmark_68_model-shard1')
  );
  fs.copyFileSync(
    path.join(faceLandmarksDir, 'face_landmark_68_model-weights_manifest.json'),
    path.join(modelsDir, 'face_landmark_68_model-weights_manifest.json')
  );
  
  console.log('Model files successfully copied to the root models directory!');
} catch (error) {
  console.error('Error copying model files:', error);
  process.exit(1);
}
