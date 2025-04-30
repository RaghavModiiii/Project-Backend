// Define the Department interface
export interface Department {
  id: string;
  department: string;
  emailId: string;
  isActive: boolean;
}

/**
 * Fetch the department of a user by their email.
 * @param email - The email of the user.
 * @returns An object containing the department or null if not found.
 */
export const getUserDepartment = async (email: string): Promise<{ department: string | null }> => {
  try {
    const response = await fetch(`http://localhost:8080/api/department/by-email/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', 
    });

    if (response.ok) {
      const data = await response.json();
      return { department: data?.department || null };
    } else if (response.status === 404) {
      return { department: null };
    } else {
      console.error('Unexpected response while fetching department:', response.statusText);
      return { department: null };
    }
  } catch (error) {
    console.error('Error fetching user department:', error);
    return { department: null };
  }
};

/**
 * Fetch all users belonging to a specific department.
 * @param department - The name of the department.
 * @returns An array of users in the department or an empty array if none are found.
 */
export const getUsersOfDepartment = async (department: string) => {
  try {
    const response = await fetch(`http://localhost:8080/api/department/by-department/${department}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', 
        });

    if (response.ok) {
      const data = await response.json();
      return data || [];
    } else {
      console.warn('No users found for the department.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching users of department:', error);
    return [];
  }
};

/**
 * Fetch all available departments.
 * @returns An array of departments or an empty array if the request fails.
 */
export const fetchDepartments = async () => {
  try {
    const response = await fetch(`http://localhost:8080/api/department`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', 
        });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to fetch departments. Status:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};