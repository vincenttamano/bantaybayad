import React, { createContext, useContext } from 'react';

const RoleContext = createContext(null);

export function RoleProvider({ role, children }) {
  return (
    <RoleContext.Provider value={role}>
      {children}
    </RoleContext.Provider>
  );
}

export function useActiveRole() {
  return useContext(RoleContext);
}
