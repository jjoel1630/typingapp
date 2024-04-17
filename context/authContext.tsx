"use client";

import { useState, createContext, useContext } from "react";
import { auth } from "../lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

const authUserContext = createContext({
	auth,
	loading: false,
	session: null,
});

export const ContextProvider = ({ children }: any) => {
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);

	onAuthStateChanged(auth, (user: any) => {
		if (user) setSession(user);
		else setSession(null);
		setLoading(false);
	});

	return (
		<authUserContext.Provider value={{ auth, loading, session }}>
			{children}
		</authUserContext.Provider>
	);
};

export const useAuthContext = () => {
	return useContext(authUserContext);
};
