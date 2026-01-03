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

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('zarvo_token', data.token);
    }
    return data;
  },

  signup: async (employeeId: string, email: string, password: string, role: string) => {
    return fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ employeeId, email, password, role }),
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
export const employeesAPI = {
  list: async () => {
    return fetchAPI('/employees');
  },

  getById: async (id: string) => {
    return fetchAPI(`/employees/${id}`);
  },

  update: async (id: string, data: any) => {
    return fetchAPI(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Attendance API
export const attendanceAPI = {
  checkIn: async (location?: string) => {
    return fetchAPI('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ location }),
    });
  },

  checkOut: async () => {
    return fetchAPI('/attendance/check-out', {
      method: 'POST',
    });
  },

  getToday: async () => {
    return fetchAPI('/attendance/today');
  },

  getWeekly: async () => {
    return fetchAPI('/attendance/weekly');
  },

  getHistory: async (employeeId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchAPI(`/attendance?${params.toString()}`);
  },

  getLogs: async (employeeId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchAPI(`/attendance/${employeeId}/logs?${params.toString()}`);
  },
};

// Leave API
export const leaveAPI = {
  apply: async (data: {
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    return fetchAPI('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  list: async (status?: string, employeeId?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (employeeId) params.append('employeeId', employeeId);
    return fetchAPI(`/leaves?${params.toString()}`);
  },

  getById: async (id: string) => {
    return fetchAPI(`/leaves/${id}`);
  },

  approve: async (id: string, comment?: string) => {
    return fetchAPI(`/leaves/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  reject: async (id: string, comment?: string) => {
    return fetchAPI(`/leaves/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  getExplanation: async (leaveRequestId: string) => {
    return fetchAPI(`/leaves/${leaveRequestId}/explanation`);
  },
};

// Payroll API
export const payrollAPI = {
  getMyPayroll: async (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    return fetchAPI(`/payroll/my?${params.toString()}`);
  },

  getAll: async (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    return fetchAPI(`/payroll?${params.toString()}`);
  },

  updateSalary: async (employeeId: string, data: any) => {
    return fetchAPI(`/payroll/${employeeId}/salary`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  downloadPayslip: async (payrollId: string) => {
    const response = await fetch(`${API_BASE_URL}/payroll/${payrollId}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('zarvo_token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to download payslip');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip-${payrollId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (role: string) => {
    return fetchAPI(`/dashboard/stats?role=${role}`);
  },

  getRecentActivity: async () => {
    return fetchAPI('/dashboard/activity');
  },
};

