import React from 'react';
import { Navigate } from 'react-router-dom';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
    
    // Clear user session to log them out
    localStorage.removeItem('architect_user');
    localStorage.removeItem('architect_token');
    
    // Hard redirect to login page with an error query parameter
    window.location.href = '/login?error=system_update';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-full bg-[#0a0a0a] text-white">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h1 className="text-2xl font-bold mb-2">Refreshing Platform...</h1>
          <p className="text-gray-400">Applying latest system updates.</p>
        </div>
      );
    }

    return this.props.children; 
  }
}
