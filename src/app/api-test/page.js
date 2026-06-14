'use client';

import { useState } from 'react';
import { deliveryAuthAPI } from '@/lib/api';
import { AlertCircle, Check, Loader2 } from 'lucide-react';

/**
 * API Testing Page
 * Use this page to test all authentication APIs
 */
export default function APITestPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Test data
  const testData = {
    register: {
      fullname: "Test User",
      email: "test@example.com",
      phone: "9876543210",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      vehicleType: "bike",
      vehicleNumber: "MH12AB1234"
    },
    login: {
      email: "test@example.com",
      password: "password123"
    },
    verifyEmail: {
      email: "test@example.com",
      otp: "123456"
    }
  };

  const testAPI = async (apiName, apiCall) => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const result = await apiCall();
      setResponse({ apiName, data: result });
    } catch (err) {
      setError({ apiName, message: err.message, status: err.status });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          API Testing Dashboard
        </h1>
        <p className="text-muted-foreground mb-8">
          Test all delivery boy authentication APIs
        </p>

        {/* API Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          
          {/* Register */}
          <div className="border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-2">
              1. Register
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              POST /api/delivery/auth/register
            </p>
            <button
              onClick={() => testAPI('register', () => deliveryAuthAPI.register(testData.register))}
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              Test Register
            </button>
          </div>

          {/* Login */}
          <div className="border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-2">
              2. Login
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              POST /api/delivery/auth/login
            </p>
            <button
              onClick={() => testAPI('login', () => deliveryAuthAPI.login(testData.login.email, testData.login.password))}
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              Test Login
            </button>
          </div>

          {/* Verify Email */}
          <div className="border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-2">
              3. Verify Email
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              POST /api/delivery/auth/verify-email
            </p>
            <button
              onClick={() => testAPI('verifyEmail', () => deliveryAuthAPI.verifyEmail(testData.verifyEmail.email, testData.verifyEmail.otp))}
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              Test Verify Email
            </button>
          </div>

          {/* Logout */}
          <div className="border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-2">
              4. Logout
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              POST /api/delivery/auth/logout
            </p>
            <button
              onClick={() => testAPI('logout', () => deliveryAuthAPI.logout())}
              disabled={loading}
              className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              Test Logout
            </button>
          </div>

        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 mb-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Testing API...</span>
          </div>
        )}

        {/* Success Response */}
        {response && (
          <div className="border border-green-200 rounded-xl p-6 bg-green-50 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">
                Success: {response.apiName}
              </h3>
            </div>
            <pre className="bg-white p-4 rounded-lg overflow-auto text-xs border border-green-200">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        )}

        {/* Error Response */}
        {error && (
          <div className="border border-red-200 rounded-xl p-6 bg-red-50 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">
                Error: {error.apiName}
              </h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-red-700">
                <strong>Status:</strong> {error.status}
              </p>
              <p className="text-sm text-red-700">
                <strong>Message:</strong> {error.message}
              </p>
            </div>
          </div>
        )}

        {/* Test Data Display */}
        <div className="border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">
            Test Data
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Register Data:</h4>
              <pre className="bg-muted p-3 rounded-lg overflow-auto text-xs">
                {JSON.stringify(testData.register, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Login Data:</h4>
              <pre className="bg-muted p-3 rounded-lg overflow-auto text-xs">
                {JSON.stringify(testData.login, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Verify Email Data:</h4>
              <pre className="bg-muted p-3 rounded-lg overflow-auto text-xs">
                {JSON.stringify(testData.verifyEmail, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-2">
            Testing Instructions
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li>Make sure your backend API is running on http://localhost:8001</li>
            <li>Test Register first to create a new user</li>
            <li>Then test Login with the same credentials</li>
            <li>Test Verify Email (OTP is hardcoded as 123456)</li>
            <li>Finally test Logout to clear the session</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
