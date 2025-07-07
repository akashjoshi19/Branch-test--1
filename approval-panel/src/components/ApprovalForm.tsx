import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import FilePicker from './FilePicker';
import { DriveFile, FileCategory, ApprovalRequest } from '../types';
import { FirestoreService } from '../services/firestore';

interface ApprovalFormData {
  category: FileCategory;
  approvers: string;
  dueDate: string;
  comments: string;
  sendReminder: boolean;
  notifyOnApproval: boolean;
  projectName: string;
}

interface ApprovalFormProps {
  onSubmitted?: (requestId: string) => void;
}

const categories: FileCategory[] = [
  'Drawing',
  'Budget',
  'Site Photo',
  'Structural PDF',
  'Excel Estimate',
  'Other'
];

const ApprovalForm: React.FC<ApprovalFormProps> = ({ onSubmitted }) => {
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const firestoreService = FirestoreService.getInstance();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ApprovalFormData>({
    defaultValues: {
      category: 'Other',
      sendReminder: true,
      notifyOnApproval: true,
      dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    }
  });

  const onSubmit = async (data: ApprovalFormData) => {
    if (!selectedFile) {
      setSubmitError('Please select a file first.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Parse approvers from comma-separated emails
      const approverEmails = data.approvers
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (approverEmails.length === 0) {
        throw new Error('Please add at least one approver email.');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = approverEmails.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        throw new Error(`Invalid email format: ${invalidEmails.join(', ')}`);
      }

      const approvers = approverEmails.map(email => ({
        email,
        status: 'pending' as const
      }));

      const requestData: Omit<ApprovalRequest, 'id' | 'createdAt'> = {
        fileId: selectedFile.id,
        fileName: selectedFile.name,
        fileType: selectedFile.mimeType,
        fileUrl: selectedFile.webViewLink,
        category: data.category,
        approvers,
        dueDate: new Date(data.dueDate).toISOString(),
        comments: data.comments,
        sendReminder: data.sendReminder,
        notifyOnApproval: data.notifyOnApproval,
        status: 'pending',
        createdBy: 'current-user@company.com', // In a real app, get from auth context
        projectName: data.projectName || undefined
      };

      let requestId: string;
      try {
        requestId = await firestoreService.createApprovalRequest(requestData);
      } catch (firestoreError) {
        console.warn('Firestore not available, using mock service');
        requestId = await firestoreService.createMockApprovalRequest(requestData);
      }

      // Reset form
      reset();
      setSelectedFile(null);

      if (onSubmitted) {
        onSubmitted(requestId);
      }

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return { icon: 'PDF', class: 'pdf' };
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return { icon: 'XLS', class: 'excel' };
    if (mimeType.includes('image')) return { icon: 'IMG', class: 'image' };
    if (mimeType.includes('zip')) return { icon: 'ZIP', class: 'zip' };
    if (mimeType.includes('dwg') || mimeType.includes('autocad')) return { icon: 'DWG', class: 'dwg' };
    return { icon: 'FILE', class: 'default' };
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-header">
          <h1 className="card-title">Request File Approval</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* File Selection */}
          <div className="form-group">
            <label className="form-label">Select File *</label>
            {!selectedFile ? (
              <FilePicker 
                onFileSelected={setSelectedFile}
                disabled={isSubmitting}
              />
            ) : (
              <div className="flex items-center">
                <div className={`file-icon ${getFileIcon(selectedFile.mimeType).class}`}>
                  {getFileIcon(selectedFile.mimeType).icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{selectedFile.name}</div>
                  <div className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="btn btn-secondary btn-sm ml-2"
                  disabled={isSubmitting}
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select 
              {...register('category', { required: 'Category is required' })}
              className="form-select"
              disabled={isSubmitting}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <div className="mt-1 text-sm" style={{ color: '#ef4444' }}>
                {errors.category.message}
              </div>
            )}
          </div>

          {/* Project Name */}
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input
              type="text"
              {...register('projectName')}
              className="form-input"
              placeholder="e.g., Downtown Office Building"
              disabled={isSubmitting}
            />
          </div>

          {/* Approvers */}
          <div className="form-group">
            <label className="form-label">Approvers *</label>
            <input
              type="text"
              {...register('approvers', { 
                required: 'At least one approver email is required'
              })}
              className="form-input"
              placeholder="manager@company.com, supervisor@company.com"
              disabled={isSubmitting}
            />
            <div className="mt-1 text-sm text-gray-500">
              Enter email addresses separated by commas
            </div>
            {errors.approvers && (
              <div className="mt-1 text-sm" style={{ color: '#ef4444' }}>
                {errors.approvers.message}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label className="form-label">Due Date *</label>
            <input
              type="date"
              {...register('dueDate', { required: 'Due date is required' })}
              className="form-input"
              disabled={isSubmitting}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
            {errors.dueDate && (
              <div className="mt-1 text-sm" style={{ color: '#ef4444' }}>
                {errors.dueDate.message}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="form-group">
            <label className="form-label">Comments/Instructions</label>
            <textarea
              {...register('comments')}
              className="form-textarea"
              placeholder="Add any additional context or instructions for the approvers..."
              disabled={isSubmitting}
            />
          </div>

          {/* Checkboxes */}
          <div className="form-group">
            <div className="form-checkbox">
              <input
                type="checkbox"
                {...register('sendReminder')}
                disabled={isSubmitting}
              />
              <label>Send reminder if not approved by due date</label>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                {...register('notifyOnApproval')}
                disabled={isSubmitting}
              />
              <label>Notify me when approved</label>
            </div>
          </div>

          {submitError && (
            <div className="mb-4 text-sm" style={{ color: '#ef4444' }}>
              {submitError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedFile || isSubmitting}
            className="btn btn-primary w-full"
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                Submitting Request...
              </>
            ) : (
              'Submit Approval Request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApprovalForm;