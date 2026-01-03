const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('zarvo_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Parse response
  let responseData;
  try {
    responseData = await response.json();
  } catch {
    // If response is not JSON, throw error
    throw new Error(`Invalid response format. Status: ${response.status}`);
  }

  // Check for HTTP errors (non-2xx status codes)
  if (!response.ok) {
    // Backend returns { success: false, message: "..." } format
    const errorMessage = responseData.message || responseData.error || `HTTP error! status: ${response.status}`;
    const error = new Error(errorMessage);
    
    // Attach status code and full error data for better error handling
    (error as any).status = response.status;
    (error as any).data = responseData;
    
    throw error;
  }

  // Safety check: Even with 200 status, verify success field
  // (Backend should always return success: true for 200 responses, but this is a safety net)
  if (responseData.success === false) {
    const errorMessage = responseData.message || 'Request failed';
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).data = responseData;
    throw error;
  }

  return responseData;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const data = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.success && data.data?.token) {
        localStorage.setItem('zarvo_token', data.data.token);
      }
      return data;
    } catch (error: any) {
      // Re-throw with proper error message from API
      throw error;
    }
  },

  signup: async (data: {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName: string;
    phoneNumber: string;
    department: string;
    position: string;
    joiningYear: number;
    role: 'EMPLOYEE' | 'HR' | 'ADMIN';
  }) => {
    return fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyEmail: async (token: string) => {
    return fetchAPI('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  logout: () => {
    localStorage.removeItem('zarvo_token');
  },
};

// Employees API
// Backend returns: { success: true, data: Employee[] | Employee | { employeeId, password, employee } }
export const employeesAPI = {
  list: async () => {
    const response = await fetchAPI('/employees');
    // Backend returns { success: true, data: Employee[] }
    return response.success ? response.data : [];
  },

  getById: async (id: string) => {
    const response = await fetchAPI(`/employees/${id}`);
    // Backend returns { success: true, data: Employee }
    return response.success ? response.data : null;
  },

  create: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    phoneNumber: string;
    department: string;
    position: string;
    joiningYear: number;
    role?: 'EMPLOYEE' | 'HR' | 'ADMIN';
  }) => {
    const response = await fetchAPI('/employees/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Backend returns { success: true, message: string, data: { employeeId, password, employee } }
    return response.success ? response.data : null;
  },

  update: async (id: string, data: any) => {
    const response = await fetchAPI(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    // Backend returns { success: true, message: string, data: Employee }
    return response.success ? response.data : null;
  },
};

// Attendance API
// Backend returns: { success: true, data: Attendance | Attendance[] }
export const attendanceAPI = {
  checkIn: async (location?: string) => {
    const response = await fetchAPI('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ location }),
    });
    // Backend returns { success: true, message: string, data: Attendance }
    return response.success ? response.data : null;
  },

  checkOut: async () => {
    const response = await fetchAPI('/attendance/check-out', {
      method: 'POST',
    });
    // Backend returns { success: true, message: string, data: Attendance }
    return response.success ? response.data : null;
  },

  getToday: async () => {
    const response = await fetchAPI('/attendance/today');
    // Backend returns { success: true, data: Attendance | null }
    return response.success ? response.data : null;
  },

  getWeekly: async () => {
    const response = await fetchAPI('/attendance/weekly');
    // Backend returns { success: true, data: Attendance[] }
    return response.success ? response.data : [];
  },

  getHistory: async (employeeId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await fetchAPI(`/attendance?${params.toString()}`);
    // Backend returns { success: true, data: Attendance[] }
    return response.success ? response.data : [];
  },

  getLogs: async (employeeId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await fetchAPI(`/attendance/${employeeId}/logs?${params.toString()}`);
    // Backend returns { success: true, data: Attendance[] }
    return response.success ? response.data : [];
  },
};

// Leave API
// Backend returns: { success: true, data: LeaveRequest | LeaveRequest[] | AIExplanation }
export const leaveAPI = {
  apply: async (data: {
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    const response = await fetchAPI('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Backend returns { success: true, message: string, data: LeaveRequest }
    return response.success ? response.data : null;
  },

  list: async (status?: string, employeeId?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (employeeId) params.append('employeeId', employeeId);
    const response = await fetchAPI(`/leaves?${params.toString()}`);
    // Backend returns { success: true, data: LeaveRequest[] } (already transformed)
    return response.success ? response.data : [];
  },

  getById: async (id: string) => {
    const response = await fetchAPI(`/leaves/${id}`);
    // Backend returns { success: true, data: LeaveRequest }
    return response.success ? response.data : null;
  },

  approve: async (id: string, comment?: string) => {
    const response = await fetchAPI(`/leaves/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
    // Backend returns { success: true, message: string, data: LeaveRequest }
    return response.success ? response.data : null;
  },

  reject: async (id: string, comment?: string) => {
    const response = await fetchAPI(`/leaves/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
    // Backend returns { success: true, message: string, data: LeaveRequest }
    return response.success ? response.data : null;
  },

  getExplanation: async (leaveRequestId: string) => {
    const response = await fetchAPI(`/leaves/${leaveRequestId}/explanation`);
    // Backend returns { success: true, data: AIExplanation }
    return response.success ? response.data : null;
  },
};

// Payroll API
// Backend returns: { success: true, data: Payroll | Payroll[] }
export const payrollAPI = {
  getMyPayroll: async (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    const response = await fetchAPI(`/payroll/my?${params.toString()}`);
    // Backend returns { success: true, data: Payroll | null, message?: string }
    return response.success ? response.data : null;
  },

  getAll: async (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    const response = await fetchAPI(`/payroll?${params.toString()}`);
    // Backend returns { success: true, data: Payroll[] }
    return response.success ? response.data : [];
  },

  updateSalary: async (employeeId: string, data: any) => {
    const response = await fetchAPI(`/payroll/${employeeId}/salary`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    // Backend returns { success: true, message: string, data: Payroll }
    return response.success ? response.data : null;
  },

  downloadPayslip: async (payrollId: string) => {
    const response = await fetch(`${API_BASE_URL}/payroll/${payrollId}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('zarvo_token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to download payslip' }));
      throw new Error(error.message || 'Failed to download payslip');
    }
    // Backend currently returns JSON, but in production would return PDF
    // For now, handle JSON response
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      // Return the payroll data for now
      return data.success ? data.data : null;
    } else {
      // Handle PDF blob when implemented
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${payrollId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  },
};

// Dashboard API
// Backend returns: { success: true, data: DashboardStats | Activity[] }
export const dashboardAPI = {
  getStats: async (role: string) => {
    const response = await fetchAPI(`/dashboard/stats?role=${role}`);
    // Backend returns { success: true, data: { totalEmployees, pendingApprovals, ... } | { checkedIn, weeklyHours, ... } }
    return response.success ? response.data : null;
  },

  getRecentActivity: async () => {
    const response = await fetchAPI('/dashboard/activity');
    // Backend returns { success: true, data: Activity[] }
    return response.success ? response.data : [];
  },
};

