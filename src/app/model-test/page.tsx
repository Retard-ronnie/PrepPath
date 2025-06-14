"use client";

import { useState, useRef } from 'react';
import * as faceapi from 'face-api.js';

export default function ModelTestPage() {
  const [log, setLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    // Auto-scroll to bottom
    setTimeout(() => {
      if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }
    }, 100);
  };

  const testModelLoading = async () => {
    setIsLoading(true);
    addLog("Starting model test...");

    try {
      // 1. Check if models directory exists via the API
      addLog("Checking models directory via API...");
      try {
        const apiResponse = await fetch('/api/models-check');
        const apiData = await apiResponse.json();
        addLog(`API check result: ${apiData.success ? 'Success' : 'Failed'}`);
        apiData.files.forEach((file: { file: string; exists: boolean }) => {
          addLog(`- ${file.file}: ${file.exists ? 'Available' : 'Missing'}`);
        });
      } catch (apiError) {
        addLog(`API check error: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
      }

      // 2. Test direct model file access
      addLog("Testing direct access to model files...");
      const filesToTest = [
        '/models/tiny_face_detector_model-weights_manifest.json',
        '/models/face_landmark_68_model-weights_manifest.json'
      ];

      for (const file of filesToTest) {
        try {
          const response = await fetch(file);
          if (response.ok) {
            addLog(`✅ Successfully accessed: ${file}`);
            const data = await response.json();
            addLog(`  Manifest contains ${data.weightsManifest?.[0]?.paths?.length || 0} weight files`);
          } else {
            addLog(`❌ Failed to access: ${file} (${response.status} ${response.statusText})`);
          }
        } catch (fetchError) {
          addLog(`❌ Error fetching ${file}: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
        }
      }

      // 3. Try loading models with face-api.js
      addLog("Attempting to load models with face-api.js...");
      
      try {
        addLog("Loading TinyFaceDetector...");
        await faceapi.nets.tinyFaceDetector.load('/models');
        addLog("✅ TinyFaceDetector loaded successfully");
      } catch (error) {
        addLog(`❌ TinyFaceDetector load error: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      try {
        addLog("Loading FaceLandmark68Net...");
        await faceapi.nets.faceLandmark68Net.load('/models');
        addLog("✅ FaceLandmark68Net loaded successfully");
      } catch (error) {
        addLog(`❌ FaceLandmark68Net load error: ${error instanceof Error ? error.message : String(error)}`);
      }

      addLog("Model test completed");
    } catch (error) {
      addLog(`Error during test: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Face-API.js Model Test</h1>
      
      <div className="mb-6">
        <button 
          onClick={testModelLoading}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Testing...' : 'Run Model Test'}
        </button>
      </div>
      
      <div className="border rounded">
        <div className="bg-gray-100 px-4 py-2 border-b font-medium flex justify-between items-center">
          <span>Test Log</span>
          {log.length > 0 && (
            <button 
              onClick={() => setLog([])} 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Log
            </button>
          )}
        </div>
        <div 
          ref={logRef}
          className="p-4 bg-black text-green-400 font-mono text-sm h-96 overflow-y-auto"
        >
          {log.length === 0 ? (
            <p className="text-gray-500">Click &apos;Run Model Test&apos; to begin testing...</p>
          ) : (
            log.map((entry, i) => (
              <div key={i} className="whitespace-pre-wrap mb-1">
                {entry}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
