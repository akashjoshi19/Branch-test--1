import { DriveFile } from '../types';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private isInitialized = false;
  private accessToken: string | null = null;

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('auth2:picker', () => {
          window.gapi.auth2.init({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'demo-client-id'
          }).then(() => {
            this.isInitialized = true;
            resolve();
          }).catch(reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const authInstance = window.gapi.auth2.getAuthInstance();
    const user = await authInstance.signIn({
      scope: 'https://www.googleapis.com/auth/drive.readonly'
    });
    
    this.accessToken = user.getAuthResponse().access_token;
    return user.isSignedIn();
  }

  async openFilePicker(): Promise<DriveFile | null> {
    if (!this.accessToken) {
      const signedIn = await this.signIn();
      if (!signedIn) return null;
    }

    return new Promise((resolve) => {
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS)
        .setOAuthToken(this.accessToken)
        .setDeveloperKey(process.env.REACT_APP_GOOGLE_API_KEY || 'demo-api-key')
        .setCallback((data: any) => {
          if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
            const file = data[window.google.picker.Response.DOCUMENTS][0];
            resolve({
              id: file[window.google.picker.Document.ID],
              name: file[window.google.picker.Document.NAME],
              webViewLink: file[window.google.picker.Document.URL],
              mimeType: file[window.google.picker.Document.MIME_TYPE],
              size: file[window.google.picker.Document.SIZE_BYTES] || 0,
              createdTime: new Date().toISOString()
            });
          } else {
            resolve(null);
          }
        })
        .build();
      
      picker.setVisible(true);
    });
  }

  // For demo purposes - mock file picker when Google APIs are not available
  async mockFilePicker(): Promise<DriveFile> {
    const mockFiles = [
      { name: 'Site Survey Photos.zip', type: 'application/zip', category: 'Site Photo' },
      { name: 'Structural Analysis.pdf', type: 'application/pdf', category: 'Structural PDF' },
      { name: 'Project Budget.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'Budget' },
      { name: 'Building Plans.dwg', type: 'application/dwg', category: 'Drawing' },
    ];

    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    
    return {
      id: `file_${Date.now()}`,
      name: randomFile.name,
      webViewLink: `https://drive.google.com/file/d/demo_${Date.now()}/view`,
      mimeType: randomFile.type,
      size: Math.floor(Math.random() * 10000000) + 1000000, // 1MB to 10MB
      createdTime: new Date().toISOString()
    };
  }
}