import * as faceapi from 'face-api.js';

// Declare global types at the top level
declare global {
  interface Window {
    debugFaceModels: () => Promise<void>;
    faceapi: typeof faceapi;
  }
}

// Add the utility to the window object when in browser environment
if (typeof window !== 'undefined') {
  // Make faceapi available globally
  window.faceapi = faceapi;
  
  window.debugFaceModels = async function() {
    console.log('=== Face-API.js Model Debug Utility ===');
    
    const modelPaths = [
      '/models/tiny_face_detector_model-weights_manifest.json',
      '/models/face_landmark_68_model-weights_manifest.json',
      '/models/tiny_face_detector_model-shard1',
      '/models/face_landmark_68_model-shard1'
    ];
    
    console.log('Testing direct fetch of model files:');
    
    for (const path of modelPaths) {
      try {
        const response = await fetch(path);
        
        if (response.ok) {
          console.log(`✅ ${path} - Status: ${response.status} ${response.statusText}`);
          
          // For manifest files, log the parsed JSON
          if (path.endsWith('.json')) {
            try {
              const data = await response.clone().json();
              console.log(`  Manifest structure:`, data);
            } catch (jsonError) {
              console.error(`  Error parsing JSON:`, jsonError);
            }
          }
        } else {
          console.error(`❌ ${path} - Status: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error(`❌ ${path} - Fetch error:`, error);
      }
    }
    
    // Try to load models directly using imported faceapi
    console.log('\nTesting face-api.js model loading:');
    
    try {
      console.log('Loading TinyFaceDetector...');
      await faceapi.nets.tinyFaceDetector.load('/models');
      console.log('✅ TinyFaceDetector loaded successfully');
    } catch (error) {
      console.error('❌ TinyFaceDetector load error:', error);
    }
    
    try {
      console.log('Loading FaceLandmark68Net...');
      await faceapi.nets.faceLandmark68Net.load('/models');
      console.log('✅ FaceLandmark68Net loaded successfully');
    } catch (error) {
      console.error('❌ FaceLandmark68Net load error:', error);
    }
    
    console.log('\nModel load status:');
    console.log('- TinyFaceDetector:', faceapi.nets.tinyFaceDetector.isLoaded ? 'Loaded' : 'Not loaded');
    console.log('- FaceLandmark68Net:', faceapi.nets.faceLandmark68Net.isLoaded ? 'Loaded' : 'Not loaded');
    
    console.log('\nDebug completed!');
  };
}

// Export an empty object to make this a proper module
export {};
