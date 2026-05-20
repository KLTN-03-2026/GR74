export const getErrorMessage = (err, fallback = "Something went wrong.") => {
  const value = err?.response?.data?.msg
    || err?.response?.data?.message
    || err?.response?.data?.error
    || err?.message
    || err;

  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || fallback;

  try {
    return JSON.stringify(value);
  } catch (error) {
    return fallback;
  }
};
