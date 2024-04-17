import {
	type User,
	signInWithEmailAndPassword,
	onAuthStateChanged as _onAuthStateChanged,
} from "firebase/auth";

import { auth } from "./config";

export function onAuthStateChanged(callback: (authUser: User | null) => void) {
	return _onAuthStateChanged(auth, callback);
}

export async function signInWithEmail(email: string, password: string) {
	try {
		const result = await signInWithEmailAndPassword(auth, email, password);

		if (!result || !result.user) return null;
		return result.user.uid;
	} catch (error) {
		console.log("Error signing in with email", error);
	}
}

export async function signOutWithEmail() {
	try {
		await auth.signOut();
	} catch (error) {
		console.error("Error signing out with email", error);
	}
}
