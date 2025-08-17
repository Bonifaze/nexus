export const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("auth_token");
};
