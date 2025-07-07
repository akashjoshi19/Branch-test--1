import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ApprovalForm from './components/ApprovalForm';
import './styles/global.css';

function App() {
  const handleRequestSubmitted = (requestId: string) => {
    // Navigate to dashboard and show success message
    alert(`Approval request submitted successfully! Request ID: ${requestId}`);
    // In a real app, you might navigate programmatically or show a toast notification
  };

  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route 
              path="/request" 
              element={<ApprovalForm onSubmitted={handleRequestSubmitted} />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
