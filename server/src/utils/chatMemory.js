const memory = {};

/**
 * Get conversation history for a user
 */
export const getMemory = (userId) => {
  const key = String(userId);
  if (!memory[key]) {
    memory[key] = [];
  }
  return memory[key];
};

/**
 * Add message to memory
 */
export const addToMemory = (userId, role, text) => {
  const key = String(userId);
  const userMemory = getMemory(key);

  userMemory.push({ role, text });

  // keep only last 10 messages
  if (userMemory.length > 10) {
    userMemory.shift();
  }
};

/**
 * Clear memory (optional helper)
 */
export const clearMemory = (userId) => {
  memory[String(userId)] = [];
};