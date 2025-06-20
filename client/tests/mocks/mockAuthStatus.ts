// This is our fake version of the useAuthStatus hook
export function useAuthStatus() {
  // For this test, we'll pretend the user is always logged in.
  // You can change this to `return false;` for other tests.
  return true;
}