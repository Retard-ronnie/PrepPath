"use client";

import { useEffect, useState } from 'react';

interface ModelFile {
  file: string;
  exists: boolean;
  path: string;
}

interface ModelStatus {
  success: boolean;
  files: ModelFile[];
  modelsPath: string;
}

export default function ModelsDebugPage() {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkModels() {
      try {
        setLoading(true);
        const response = await fetch('/api/models-check');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setModelStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error checking models:', err);
      } finally {
        setLoading(false);
      }
    }

    checkModels();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Face Detection Models Debug</h1>
      
      {loading && <p>Loading model status...</p>}
      
      {error && (
        <div className="p-4 mb-4 border border-red-500 bg-red-50 text-red-700 rounded">
          <h2 className="font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      )}
      
      {modelStatus && (
        <div className="space-y-6">
          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold mb-2">Model Status</h2>
            <p className="mb-2">
              Overall Status: 
              <span className={modelStatus.success ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {modelStatus.success ? " All models available" : " Missing models"}
              </span>
            </p>
            <p className="mb-2">Models Directory: <code className="bg-gray-100 px-1 py-0.5 rounded">{modelStatus.modelsPath}</code></p>
          </div>
          
          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold mb-2">Model Files</h2>
            <div className="space-y-2">
              {modelStatus.files && modelStatus.files.map((file: ModelFile, index: number) => (
                <div key={index} className="p-2 border-b last:border-b-0">
                  <p className="flex justify-between">
                    <span>{file.file}</span>
                    <span className={file.exists ? "text-green-600" : "text-red-600"}>
                      {file.exists ? "✓ Available" : "✗ Missing"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 break-all">{file.path}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold mb-2">Troubleshooting</h2>
            <p className="mb-2">If you&apos;re seeing model loading errors:</p>
            <ol className="list-decimal list-inside space-y-1">              <li>Ensure all model files are available in the <code className="bg-gray-100 px-1 py-0.5 rounded">/public/models/</code> directory</li>
              <li>Check browser console for specific loading errors</li>
              <li>Run <code className="bg-gray-100 px-1 py-0.5 rounded">npm run download-face-models</code> to download model files</li>
              <li>Run <code className="bg-gray-100 px-1 py-0.5 rounded">node scripts/reorganize-face-models.js</code> to copy models to root directory</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
