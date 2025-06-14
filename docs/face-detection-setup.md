# Face Detection Setup for Interview Monitoring

This document provides information about the face detection feature implemented in the PrepPath application for monitoring user attention during interviews.

## Overview

The face detection feature uses face-api.js to detect and track user faces during interview sessions. This helps:
- Ensure the user is present during the interview
- Monitor if the user is looking away from the screen
- Detect if multiple people are present (which may indicate cheating)

## Required Model Files

The following model files are needed for the face detection to work:

1. **Tiny Face Detector**:
   - `tiny_face_detector_model-shard1`
   - `tiny_face_detector_model-weights_manifest.json`

2. **Face Landmark Detection**:
   - `face_landmark_68_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`

These files must be placed in the `/public/models/` directory in their respective folders.

## Setup Instructions

1. **Automatic Setup**:
   Run the provided npm script to download the model files:
   ```
   npm run download-face-models
   ```
   
   Or directly run the Node.js script:
   ```
   node scripts/download-face-api-models.js
   ```

2. **Manual Setup**:
   Alternatively, you can manually download the files from the [face-api.js GitHub repository](https://github.com/justadudewhohacks/face-api.js/tree/master/weights) and place them in the appropriate directories.

## Implementation Details

The face detection is implemented in the following components:

1. **CameraMonitor.tsx**: Handles the actual face detection using face-api.js and provides visual feedback.
2. **FaceDetectionModal.tsx**: Manages camera permissions and provides instructions to the user.
3. **InterviewRecorder.tsx**: Tracks and records face detection data during the interview.

## How Face Detection Works

1. When a user starts an interview, they are prompted to grant camera access.
2. Once granted, the application loads the face detection models.
3. During the interview, the application continuously analyzes:
   - Whether a face is detected at all
   - If the user is looking away (based on facial landmarks)
   - If multiple faces are detected
4. This data is used to calculate an "Attention Score" and can be exported with the interview results.

## Troubleshooting

If face detection is not working:

1. Make sure all model files are correctly placed in the `/public/models/` directory.
2. Check browser console for any errors related to loading the models.
3. Ensure the user has granted camera permissions.
4. Try in a different browser if issues persist.
5. Visit the `/models-debug` page in your application to check model file availability.
6. If models are found in subdirectories but not loading, run:
   ```
   node scripts/reorganize-face-models.js
   ```
   This will copy the model files from subdirectories to the root models directory.
7. Clear your browser cache and reload the page.

## Privacy Considerations

Important privacy notes:
- Video is processed locally and not recorded or transmitted.
- Only detection results (not images) are stored with interview data.
- Users must explicitly grant camera permissions.