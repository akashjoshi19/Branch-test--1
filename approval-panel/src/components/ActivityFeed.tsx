import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ActivityLog } from '../types';
import { FirestoreService } from '../services/firestore';

interface ActivityFeedProps {
  requestId: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ requestId }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const firestoreService = FirestoreService.getInstance();

  useEffect(() => {
    loadActivities();
  }, [requestId]);

  const loadActivities = async () => {
    try {
      let activityData: ActivityLog[];
      try {
        activityData = await firestoreService.getActivityLogs(requestId);
      } catch (firestoreError) {
        console.warn('Firestore not available, using mock activity data');
        activityData = getMockActivityLogs(requestId);
      }
      setActivities(activityData);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock activity logs for demo
  const getMockActivityLogs = (requestId: string): ActivityLog[] => {
    const baseActivities: ActivityLog[] = [
      {
        id: `${requestId}_activity_1`,
        approvalId: requestId,
        action: 'Approval requested',
        user: 'engineer@company.com',
        timestamp: '2024-01-15T09:00:00Z'
      }
    ];

    // Add more activities based on request ID for demo
    if (requestId === 'mock_1') {
      baseActivities.push({
        id: `${requestId}_activity_2`,
        approvalId: requestId,
        action: 'Approved by manager@company.com',
        user: 'manager@company.com',
        timestamp: '2024-01-15T10:30:00Z',
        comment: 'Photos look good, site access is clear'
      });
    } else if (requestId === 'mock_2') {
      baseActivities.push(
        {
          id: `${requestId}_activity_2`,
          approvalId: requestId,
          action: 'Approved by structural@company.com',
          user: 'structural@company.com',
          timestamp: '2024-01-14T15:45:00Z',
          comment: 'Calculations are correct'
        },
        {
          id: `${requestId}_activity_3`,
          approvalId: requestId,
          action: 'Approved by project.lead@company.com',
          user: 'project.lead@company.com',
          timestamp: '2024-01-14T16:20:00Z',
          comment: 'Final approval granted'
        }
      );
    }

    return baseActivities.reverse(); // Most recent first
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Approved')) return '✅';
    if (action.includes('Rejected')) return '❌';
    if (action.includes('requested')) return '📝';
    if (action.includes('reminder')) return '📧';
    return '📋';
  };

  const getUserInitials = (email: string) => {
    const name = email.split('@')[0];
    return name.split('.').map(part => part.charAt(0).toUpperCase()).join('');
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span className="ml-2">Loading activity...</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-medium mb-3">Activity Log</h4>
      <div className="space-y-0">
        {activities.map((activity, index) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-avatar">
              {getUserInitials(activity.user)}
            </div>
            <div className="activity-content">
              <div className="activity-action">
                <span className="mr-2">{getActionIcon(activity.action)}</span>
                {activity.action}
              </div>
              <div className="activity-time">
                {format(new Date(activity.timestamp), 'MMM d, yyyy HH:mm')}
              </div>
              {activity.comment && (
                <div className="activity-comment">
                  "{activity.comment}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;