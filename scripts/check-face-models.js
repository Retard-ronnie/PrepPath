// Test script to load face-api.js models for debugging
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../public/models');

console.log('Checking face-api.js model files...');

// Function to check if a file exists and has content
function checkFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✓ ${path.basename(filePath)} - ${stats.size} bytes`);
      return true;
    } else {
      console.log(`✗ ${path.basename(filePath)} - Not found`);
      return false;
    }
  } catch (error) {
    console.error(`Error checking ${filePath}:`, error.message);
    return false;
  }
}

// Check if models directory exists
if (!fs.existsSync(modelsDir)) {
  console.error('Models directory does not exist!');
  process.exit(1);
}

console.log(`Models directory: ${modelsDir}`);

// Check root model files
const rootModelFiles = [
  'tiny_face_detector_model-shard1',
  'tiny_face_detector_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_landmark_68_model-weights_manifest.json'
];

console.log('\nChecking root model files:');
const rootFilesOk = rootModelFiles.every(file => 
  checkFile(path.join(modelsDir, file))
);

// Check if subdirectories exist
const tinyFaceDir = path.join(modelsDir, 'tiny_face_detector');
const faceLandmarksDir = path.join(modelsDir, 'face_landmark_68');

console.log('\nChecking model subdirectories:');
console.log(`Tiny Face Detector directory: ${fs.existsSync(tinyFaceDir) ? 'exists' : 'missing'}`);
console.log(`Face Landmarks directory: ${fs.existsSync(faceLandmarksDir) ? 'exists' : 'missing'}`);

// Check manifest files for correct paths
console.log('\nChecking manifest files for correct paths:');

function checkManifestPaths(manifestPath) {
  try {
    if (fs.existsSync(manifestPath)) {
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      
      if (manifest && manifest.length > 0 && manifest[0].paths) {
        console.log(`Manifest ${path.basename(manifestPath)} paths:`, manifest[0].paths);
        return true;
      } else {
        console.log(`Manifest ${path.basename(manifestPath)} has invalid format or missing paths`);
        return false;
      }
    } else {
      console.log(`Manifest ${path.basename(manifestPath)} not found`);
      return false;
    }
  } catch (error) {
    console.error(`Error reading manifest ${manifestPath}:`, error.message);
    return false;
  }
}

checkManifestPaths(path.join(modelsDir, 'tiny_face_detector_model-weights_manifest.json'));
checkManifestPaths(path.join(modelsDir, 'face_landmark_68_model-weights_manifest.json'));

console.log('\nModel check completed.');

if (!rootFilesOk) {
  console.log('\nSome model files are missing. Run the following commands to fix:');
  console.log('1. npm run download-face-models');
  console.log('2. node scripts/reorganize-face-models.js');
}
