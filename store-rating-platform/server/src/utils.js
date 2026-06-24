export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export const pick = (value, allowed, fallback) =>
  allowed.includes(value) ? value : fallback;

export const getSort = (query, allowed, fallback = "name") => ({
  sortBy: pick(query.sortBy, allowed, fallback),
  sortOrder: query.sortOrder === "desc" ? "desc" : "asc"
});

export const average = (items) => {
  if (!items.length) return 0;
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return Number((total / items.length).toFixed(1));
};

export const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  address: user.address,
  role: user.role
});
