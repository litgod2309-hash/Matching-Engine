export const getUsers = () => {
  return JSON.parse(localStorage.getItem("users")) || [];
};

export const saveUsers = (users) => {
  localStorage.setItem("users", JSON.stringify(users));
};

export const setCurrentUser = (user) => {
  sessionStorage.setItem("currentUser", JSON.stringify(user));
};

export const getCurrentUser = () => {
  return JSON.parse(sessionStorage.getItem("currentUser"));
};

export const logoutUser = () => {
  sessionStorage.removeItem("currentUser");
};

export const getOrders = () => {
  return JSON.parse(localStorage.getItem("orders")) || [];
};

export const saveOrders = (orders) => {
  localStorage.setItem("orders", JSON.stringify(orders));
};
