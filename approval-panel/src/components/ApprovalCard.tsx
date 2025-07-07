import React, { useState } from 'react';
import { format, isAfter } from 'date-fns';
import { ApprovalRequest, Approver } from '../types';
import ActivityFeed from './ActivityFeed';

interface ApprovalCardProps {
  request: ApprovalRequest;
  onStatusUpdate: () => void;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({ request, onStatusUpdate }) => {
  const [showActivity, setShowActivity] = useState(false);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return { icon: 'PDF', class: 'pdf' };
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return { icon: 'XLS', class: 'excel' };
    if (fileType.includes('image')) return { icon: 'IMG', class: 'image' };
    if (fileType.includes('zip')) return { icon: 'ZIP', class: 'zip' };
    if (fileType.includes('dwg') || fileType.includes('autocad')) return { icon: 'DWG', class: 'dwg' };
    return { icon: 'FILE', class: 'default' };
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved': return 'status-badge status-approved';
      case 'rejected': return 'status-badge status-rejected';
      case 'pending': return 'status-badge status-pending';
      default: return 'status-badge status-pending';
    }
  };

  const getApproverStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved': return 'status-badge status-approved';
      case 'rejected': return 'status-badge status-rejected';
      case 'pending': return 'status-badge status-pending';
      default: return 'status-badge status-pending';
    }
  };

  const isOverdue = () => {
    return request.status === 'pending' && isAfter(new Date(), new Date(request.dueDate));
  };

  const getLatestComment = () => {
    const approvedApprover = request.approvers.find(a => a.status === 'approved' && a.comment);
    const rejectedApprover = request.approvers.find(a => a.status === 'rejected' && a.comment);
    
    if (rejectedApprover?.comment) return rejectedApprover.comment;
    if (approvedApprover?.comment) return approvedApprover.comment;
    return request.comments || 'No additional comments';
  };

  const fileIcon = getFileIcon(request.fileType);
  const dueDate = new Date(request.dueDate);

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center">
          <div className={`file-icon ${fileIcon.class}`}>
            {fileIcon.icon}
          </div>
          <div>
            <h3 className="font-semibold">
              <a 
                href={request.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {request.fileName}
              </a>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">{request.category}</span>
              {request.projectName && (
                <>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{request.projectName}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={getStatusBadgeClass(request.status)}>
            {request.status}
          </span>
          {isOverdue() && (
            <span className="status-badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
              Overdue
            </span>
          )}
        </div>
      </div>

      {/* Approvers */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Approvers</h4>
        <div className="grid gap-2">
          {request.approvers.map((approver, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <div className="activity-avatar">
                  {approver.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium">{approver.email}</div>
                  {approver.approvedAt && (
                    <div className="text-xs text-gray-500">
                      {format(new Date(approver.approvedAt), 'MMM d, yyyy HH:mm')}
                    </div>
                  )}
                </div>
              </div>
              <span className={getApproverStatusBadgeClass(approver.status)}>
                {approver.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">Due Date</div>
          <div className={`text-sm ${isOverdue() ? 'text-red-600 font-medium' : ''}`}>
            {format(dueDate, 'MMM d, yyyy')}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Created</div>
          <div className="text-sm">
            {format(new Date(request.createdAt), 'MMM d, yyyy HH:mm')}
          </div>
        </div>
      </div>

      {/* Latest Comment */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">Latest Comment</div>
        <div className="text-sm bg-gray-50 p-2 rounded italic">
          "{getLatestComment()}"
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setShowActivity(!showActivity)}
            className="btn btn-secondary btn-sm"
          >
            📊 {showActivity ? 'Hide' : 'Show'} Activity
          </button>
          
          {request.status === 'pending' && (
            <button
              onClick={() => {
                // In a real app, this would send reminder emails
                alert('Reminder sent to pending approvers!');
              }}
              className="btn btn-secondary btn-sm"
            >
              📧 Send Reminder
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-500">
          {request.sendReminder && <span title="Reminder enabled">🔔</span>}
          {request.notifyOnApproval && <span title="Notification enabled">📬</span>}
        </div>
      </div>

      {/* Activity Feed */}
      {showActivity && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <ActivityFeed requestId={request.id} />
        </div>
      )}
    </div>
  );
};

export default ApprovalCard;