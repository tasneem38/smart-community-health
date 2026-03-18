import React, { createContext, useReducer, useEffect, useMemo } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToken, removeToken } from "../api/auth";

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
  village?: string;
  token?: string;
} | null;

type State = {
  user: User;
  isLoading: boolean;
};

type Action =
  | { type: "RESTORE_TOKEN"; payload: User }
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" };

const initialState: State = {
  user: null,
  isLoading: true,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...state,
        user: action.payload,
        isLoading: false,
      };
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isLoading: false,
      };
    default:
      return state;
  }
}

export const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let user = null;
      try {
        const json = await AsyncStorage.getItem('user');
        user = json != null ? JSON.parse(json) : null;
      } catch (e) {
        console.log('Failed to restore token', e);
      }
      dispatch({ type: 'RESTORE_TOKEN', payload: user });
    };

    bootstrapAsync();
  }, []);

  const authActions = useMemo(() => ({
    login: async (user: User) => {
      try {
        if (user?.token) {
          await saveToken(user.token);
        }
        await AsyncStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: "LOGIN", payload: user });
      } catch (e) {
        console.error(e);
      }
    },
    logout: async () => {
      try {
        await removeToken();
        await AsyncStorage.removeItem('user');
        dispatch({ type: "LOGOUT" });
      } catch (e) {
        console.error(e);
      }
    },
    state,
  }), [state]);

  if (state.isLoading) {
    // You might want to return a Splash Screen here
    return null;
  }

  return (
    <AuthContext.Provider value={authActions}>
      {children}
    </AuthContext.Provider>
  );
};
