// Interface representing a local user
export interface LocalUser {
  name: string;
  email: string;
  loginMethod: 'google' | 'manual' | '';
}

/**
 * Fetch the user data from local storage or the server.
 * If the data is available in local storage, it is returned directly.
 * Otherwise, it fetches the user data from the server and updates local storage.
 * @returns A promise that resolves to the user data or null if the request fails.
 */
export const getUser = async (): Promise<LocalUser | null> => {
  const storedName = localStorage.getItem('name');
  const storedEmail = localStorage.getItem('email');
  const storedLoginMethod = localStorage.getItem('loginMethod') as 'google' | 'manual' | '';

  if (storedName && storedEmail) {
    return {
      name: storedName,
      email: storedEmail,
      loginMethod: storedLoginMethod || '',
    };
  }

  try {
    const response = await fetch('http://localhost:8080/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
       });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();

    localStorage.setItem('name', userData.name);
    localStorage.setItem('email', userData.email);

    if (userData.loginMethod === 'google') {
      localStorage.setItem('loginMethod', 'google');
    } else if (userData.loginMethod === 'manual') {
      localStorage.setItem('loginMethod', 'manual');
    }

    return { name: userData.name, email: userData.email, loginMethod: userData.loginMethod };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};