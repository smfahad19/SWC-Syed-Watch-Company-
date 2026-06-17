// utils/activeUsers.js
const activeUsers = new Map(); // userId -> lastSeen timestamp

export const updateUserActivity = (userId) => {
  activeUsers.set(userId, Date.now());
};

export const getActiveUsersCount = (timeWindowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  let count = 0;
  for (const [, lastSeen] of activeUsers) {
    if (now - lastSeen < timeWindowMs) count++;
  }
  return count;
};

// Clean up inactive users every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [userId, lastSeen] of activeUsers) {
    if (now - lastSeen > 30 * 60 * 1000) activeUsers.delete(userId);
  }
}, 5 * 60 * 1000);