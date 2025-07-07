import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ApprovalRequest, ActivityLog, Approver } from '../types';

export class FirestoreService {
  private static instance: FirestoreService;

  static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  // Approval Requests
  async createApprovalRequest(request: Omit<ApprovalRequest, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'approvalRequests'), {
        ...request,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      
      // Log the creation activity
      await this.addActivityLog({
        approvalId: docRef.id,
        action: 'Approval requested',
        user: request.createdBy,
        timestamp: new Date().toISOString()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating approval request:', error);
      throw error;
    }
  }

  async getApprovalRequests(): Promise<ApprovalRequest[]> {
    try {
      const q = query(collection(db, 'approvalRequests'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ApprovalRequest[];
    } catch (error) {
      console.error('Error fetching approval requests:', error);
      return [];
    }
  }

  async updateApprovalStatus(
    requestId: string, 
    approverEmail: string, 
    status: 'approved' | 'rejected', 
    comment?: string
  ): Promise<void> {
    try {
      const requestRef = doc(db, 'approvalRequests', requestId);
      
      // Get current request data
      const requests = await this.getApprovalRequests();
      const request = requests.find(r => r.id === requestId);
      
      if (!request) throw new Error('Request not found');

      // Update the specific approver's status
      const updatedApprovers = request.approvers.map(approver => 
        approver.email === approverEmail 
          ? { 
              ...approver, 
              status, 
              approvedAt: new Date().toISOString(),
              comment 
            }
          : approver
      );

      // Determine overall status
      const allApproved = updatedApprovers.every(a => a.status === 'approved');
      const anyRejected = updatedApprovers.some(a => a.status === 'rejected');
      const overallStatus = anyRejected ? 'rejected' : allApproved ? 'approved' : 'pending';

      await updateDoc(requestRef, {
        approvers: updatedApprovers,
        status: overallStatus
      });

      // Log the activity
      await this.addActivityLog({
        approvalId: requestId,
        action: status === 'approved' ? `Approved by ${approverEmail}` : `Rejected by ${approverEmail}`,
        user: approverEmail,
        timestamp: new Date().toISOString(),
        comment
      });

    } catch (error) {
      console.error('Error updating approval status:', error);
      throw error;
    }
  }

  // Activity Logs
  async addActivityLog(log: Omit<ActivityLog, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, 'activityLogs'), log);
    } catch (error) {
      console.error('Error adding activity log:', error);
    }
  }

  async getActivityLogs(approvalId: string): Promise<ActivityLog[]> {
    try {
      const q = query(
        collection(db, 'activityLogs'),
        where('approvalId', '==', approvalId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityLog[];
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  }

  // Real-time subscriptions
  subscribeToApprovalRequests(callback: (requests: ApprovalRequest[]) => void) {
    const q = query(collection(db, 'approvalRequests'), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ApprovalRequest[];
      callback(requests);
    });
  }

  subscribeToActivityLogs(approvalId: string, callback: (logs: ActivityLog[]) => void) {
    const q = query(
      collection(db, 'activityLogs'),
      where('approvalId', '==', approvalId),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityLog[];
      callback(logs);
    });
  }

  // Mock data for demo (when Firebase is not available)
  private mockRequests: ApprovalRequest[] = [
    {
      id: 'mock_1',
      fileId: 'file_1',
      fileName: 'Site Survey Photos.zip',
      fileType: 'application/zip',
      fileUrl: 'https://drive.google.com/file/d/demo_123/view',
      category: 'Site Photo',
      approvers: [
        { email: 'manager@company.com', status: 'approved', approvedAt: '2024-01-15T10:30:00Z' },
        { email: 'supervisor@company.com', status: 'pending' }
      ],
      dueDate: '2024-01-20T23:59:59Z',
      comments: 'Please review the photos from the morning site visit',
      sendReminder: true,
      notifyOnApproval: true,
      status: 'pending',
      createdAt: '2024-01-15T09:00:00Z',
      createdBy: 'engineer@company.com',
      projectName: 'Downtown Office Building'
    },
    {
      id: 'mock_2',
      fileId: 'file_2',
      fileName: 'Structural Analysis Report.pdf',
      fileType: 'application/pdf',
      fileUrl: 'https://drive.google.com/file/d/demo_456/view',
      category: 'Structural PDF',
      approvers: [
        { email: 'structural@company.com', status: 'approved', approvedAt: '2024-01-14T15:45:00Z' },
        { email: 'project.lead@company.com', status: 'approved', approvedAt: '2024-01-14T16:20:00Z' }
      ],
      dueDate: '2024-01-18T23:59:59Z',
      comments: 'Final structural calculations for foundation design',
      sendReminder: false,
      notifyOnApproval: true,
      status: 'approved',
      createdAt: '2024-01-14T14:00:00Z',
      createdBy: 'engineer@company.com',
      projectName: 'Downtown Office Building'
    }
  ];

  async getMockApprovalRequests(): Promise<ApprovalRequest[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.mockRequests];
  }

  async createMockApprovalRequest(request: Omit<ApprovalRequest, 'id' | 'createdAt'>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newId = `mock_${Date.now()}`;
    const newRequest: ApprovalRequest = {
      ...request,
      id: newId,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    this.mockRequests.unshift(newRequest);
    return newId;
  }
}