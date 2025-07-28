import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to error utilities if available
    if (window.errorUtils) {
      window.errorUtils.logError(error, 'React Component Error');
    }
    
    // Optional: Send to a logging service for IT troubleshooting
    // This could be implemented via IPC to the main process
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    });
    
    // Call the resetAction prop if provided
    if (this.props.resetAction) {
      this.props.resetAction();
    }
  };
  
  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallback, resetActionText } = this.props;
    
    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback(error, this.handleReset);
      }
      
      // Format error message for display
      const errorMessage = window.errorUtils 
        ? window.errorUtils.formatErrorMessage(error)
        : (error?.message || 'An unexpected error occurred');
      
      // Render fallback UI
      return (
        <Card className="m-4 border-destructive shadow-md">
          <CardHeader>
            <CardTitle className="text-destructive">Something went wrong</CardTitle>
            <CardDescription>
              An error occurred in this section of the application. Other parts of the app should still work correctly.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <p className="mb-4 text-sm font-medium">
              {errorMessage}
            </p>
            
            {showDetails && errorInfo && (
              <div className="mb-4 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                <p className="font-semibold mb-1">Error details (for IT support):</p>
                <pre className="whitespace-pre-wrap">
                  {error?.stack || error?.toString() || JSON.stringify(error, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.toggleDetails}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              
              {this.props.resetAction && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={this.props.resetAction}
                >
                  {resetActionText || 'Reset'}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      );
    }

    return children;
  }
}

export default ErrorBoundary;