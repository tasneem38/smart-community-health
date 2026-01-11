import React, { createContext, useReducer } from "react";

/* ---------------------------------------------
   USER ROLES
---------------------------------------------- */
export type Role = "ASHA" | "CLINIC" | "LOCALITE";

/* ---------------------------------------------
   USER TYPE
---------------------------------------------- */
export type User = {
  id: string;
  name: string;
  role: Role;
  village?: string;  // 🔥 added
  token?: string;
} | null;

type State = { user: User };

type Action =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" };

const initialState: State = { user: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      return { user: null };
    default:
      return state;
  }
}

export const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const authActions = {
    login: (user: User) => dispatch({ type: "LOGIN", payload: user }),
    logout: () => dispatch({ type: "LOGOUT" }),
    state,
  };

  return (
    <AuthContext.Provider value={authActions}>
      {children}
    </AuthContext.Provider>
  );
};
