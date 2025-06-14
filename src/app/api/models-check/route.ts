import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const modelsDir = path.join(publicDir, 'models');
    
    // Check if models directory exists
    if (!fs.existsSync(modelsDir)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Models directory does not exist',
          path: modelsDir 
        }, 
        { status: 404 }
      );
    }
    
    // List of model files that should exist
    const requiredFiles = [
      'tiny_face_detector_model-shard1',
      'tiny_face_detector_model-weights_manifest.json',
      'face_landmark_68_model-shard1',
      'face_landmark_68_model-weights_manifest.json'
    ];
    
    const fileStatus = requiredFiles.map(file => {
      const filePath = path.join(modelsDir, file);
      const exists = fs.existsSync(filePath);
      return {
        file,
        exists,
        path: filePath
      };
    });
    
    const allFilesExist = fileStatus.every(f => f.exists);
    
    return NextResponse.json({
      success: allFilesExist,
      files: fileStatus,
      modelsPath: modelsDir
    });
    
  } catch (error) {
    console.error('Error checking model files:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 
      { status: 500 }
    );
  }
}