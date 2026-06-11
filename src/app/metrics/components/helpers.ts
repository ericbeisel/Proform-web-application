export const fmt = (v: unknown, decimals = 0): string => {
  const n = Number(v);
  if (isNaN(n)) return "0";
  return decimals ? n.toFixed(decimals) : Math.round(n).toString();
};

export const calculateDaysAgo = (dateStr?: string): string => {
  if (!dateStr) return "just now";
  const lastDate = new Date(dateStr);
  if (isNaN(lastDate.getTime())) return "just now";
  const diffMs = Math.max(0, Date.now() - lastDate.getTime());
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffSecs < 60) return `${Math.max(1, diffSecs)} ${diffSecs === 1 ? "second" : "seconds"} ago`;
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;
};
