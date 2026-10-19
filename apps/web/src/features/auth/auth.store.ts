export const useAuthStore = (selector?: (state: any) => any) => {
  const state = { user: null, isAuthenticated: false, logout: () => {} };
  return typeof selector === 'function' ? selector(state) : state;
};
export default useAuthStore;
