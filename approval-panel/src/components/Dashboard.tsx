import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ApprovalRequest, ActivityLog } from '../types';
import { FirestoreService } from '../services/firestore';
import ApprovalCard from './ApprovalCard';

const Dashboard: React.FC = () => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  
  const firestoreService = FirestoreService.getInstance();

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, statusFilter, projectFilter]);

  const loadRequests = async () => {
    try {
      let requestData: ApprovalRequest[];
      try {
        requestData = await firestoreService.getApprovalRequests();
      } catch (firestoreError) {
        console.warn('Firestore not available, using mock data');
        requestData = await firestoreService.getMockApprovalRequests();
      }
      setRequests(requestData);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (projectFilter !== 'all') {
      filtered = filtered.filter(request => request.projectName === projectFilter);
    }

    setFilteredRequests(filtered);
  };

  const getUniqueProjects = () => {
    const projects = requests
      .map(request => request.projectName)
      .filter((project): project is string => Boolean(project));
    return Array.from(new Set(projects));
  };

  const getStatusCounts = () => {
    const counts = {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();
  const uniqueProjects = getUniqueProjects();

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="loading">
          <div className="spinner"></div>
          <span className="ml-2">Loading approvals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="card-title">Approval Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={loadRequests}
            className="btn btn-secondary btn-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-3 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-semibold">{statusCounts.pending}</div>
          <div className="text-sm text-gray-600">Pending Approvals</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-green-600">{statusCounts.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-red-600">{statusCounts.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status ({statusCounts.all})</option>
            <option value="pending">Pending ({statusCounts.pending})</option>
            <option value="approved">Approved ({statusCounts.approved})</option>
            <option value="rejected">Rejected ({statusCounts.rejected})</option>
          </select>
        </div>

        {uniqueProjects.length > 0 && (
          <div className="filter-group">
            <label>Project</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="all">All Projects</option>
              {uniqueProjects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Approval Requests */}
      {filteredRequests.length === 0 ? (
        <div className="card text-center">
          <div className="text-gray-500">
            {requests.length === 0 
              ? 'No approval requests yet. Create your first request!' 
              : 'No requests match the current filters.'
            }
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map(request => (
            <ApprovalCard 
              key={request.id} 
              request={request}
              onStatusUpdate={loadRequests}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;