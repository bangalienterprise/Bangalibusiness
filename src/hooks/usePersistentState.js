
import React, { useState } from 'react';

// Reverted to standard useState behavior to remove persistence
export function usePersistentState(key, initialValue) {
  return useState(initialValue);
}
