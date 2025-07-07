export interface User {
  id: string;
  email: string;
  name: string;
}

export interface DriveFile {
  id: string;
  name: string;
  webViewLink: string;
  mimeType: string;
  size: number;
  createdTime: string;
}

export interface Approver {
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  comment?: string;
}

export interface ApprovalRequest {
  id: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  category: string;
  approvers: Approver[];
  dueDate: string;
  comments: string;
  sendReminder: boolean;
  notifyOnApproval: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  createdBy: string;
  projectName?: string;
}

export interface ActivityLog {
  id: string;
  approvalId: string;
  action: string;
  user: string;
  timestamp: string;
  comment?: string;
}

export type FileCategory = 
  | 'Drawing'
  | 'Budget' 
  | 'Site Photo'
  | 'Structural PDF'
  | 'Excel Estimate'
  | 'Other';