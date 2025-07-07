import React, { useState } from 'react';
import { GoogleDriveService } from '../services/googleDrive';
import { DriveFile } from '../types';

interface FilePickerProps {
  onFileSelected: (file: DriveFile) => void;
  disabled?: boolean;
}

const FilePicker: React.FC<FilePickerProps> = ({ onFileSelected, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const driveService = GoogleDriveService.getInstance();

  const handleFilePicker = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to use Google Drive API first
      let selectedFile: DriveFile | null = null;
      
      try {
        selectedFile = await driveService.openFilePicker();
      } catch (googleError) {
        console.warn('Google Drive API not available, using mock file picker');
        // Fallback to mock file picker for demo purposes
        selectedFile = await driveService.mockFilePicker();
      }

      if (selectedFile) {
        onFileSelected(selectedFile);
      }
    } catch (err) {
      setError('Failed to select file. Please try again.');
      console.error('File picker error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="file-picker">
      <button
        type="button"
        onClick={handleFilePicker}
        disabled={disabled || isLoading}
        className="btn btn-primary"
      >
        {isLoading ? (
          <>
            <div className="spinner"></div>
            Selecting File...
          </>
        ) : (
          <>
            📁 Select File from Google Drive
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-sm" style={{ color: '#ef4444' }}>
          {error}
        </div>
      )}
      
      <div className="mt-2 text-sm text-gray-500">
        Select any file from your Google Drive (photos, PDFs, Excel files, etc.)
      </div>
    </div>
  );
};

export default FilePicker;