import { Department } from "./getUserDepartment";

/**
 * Fetch users belonging to a specific department.
 * @param department - The name of the department.
 * @returns A promise that resolves to an array of Department objects.
 * @throws An error if the request fails.
 */
export const fetchUsers = async (department: string): Promise<Department[]> => {
  const response = await fetch(`http://localhost:8080/api/department/by-department/${department}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users for department');
  }

  return response.json();
};

/**
 * Fetch all unique department names.
 * @returns A promise that resolves to an array of department names (strings).
 * @throws An error if the request fails.
 */
export const getAllDepartments = async (): Promise<string[]> => {
  const response = await fetch("http://localhost:8080/api/department/unique", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch departments');
  }

  return await response.json();
};

/**
 * Update the active status of a department by email ID.
 * @param emailId - The email ID of the department to update.
 * @param newStatus - The new active status (true for active, false for inactive).
 * @returns A promise that resolves to the updated department object.
 * @throws An error if the request fails.
 */
export const updateDepartmentStatus = async (emailId: string, newStatus: boolean): Promise<any> => {
  const response = await fetch(`http://localhost:8080/api/department/status/${emailId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      isActive: newStatus,
    }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to update department status');
  }

  return await response.json();
};