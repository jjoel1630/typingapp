"use client";

import { createSession, removeSession } from "@/actions/auth-actions";
import { useUserSession } from "@/hooks/use-user-session";
import { signInWithEmail, signOutWithEmail } from "@/lib/firebase/auth";
import { Auth } from "firebase/auth";
import React, { FormEvent, MouseEvent, useState } from "react";

type Props = {
	auth: Auth;
};

function SignIn({ session }: { session: string | null }) {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [fail, setFail] = useState<boolean>(false);
	const userSessionID = useUserSession(session);

	const handleSignIn = async (e: FormEvent) => {
		e.preventDefault();
		const userUid = await signInWithEmail(email, password);
		if (userUid) await createSession(userUid);
		else setFail(true);
	};

	const handleSignOut = async () => {
		await signOutWithEmail();
		removeSession();
	};

	if (userSessionID) {
		return (
			<>
				{/* <p>{userSessionID}</p> */}
				<button onClick={handleSignOut}>Sign Out</button>
			</>
		);
	}

	return (
		<div>
			<form onSubmit={handleSignIn}>
				<input
					type="text"
					name="email"
					id="email"
					placeholder="Email"
					onChange={(e) => setEmail(e.target.value)}
				/>
				<br />
				<input
					type="text"
					name="password"
					id="password"
					placeholder="Password"
					onChange={(e) => setPassword(e.target.value)}
				/>
				<br />
				<input type="submit" value="Sign In" />
			</form>
			{fail && <h4>Incorrect PWD Email</h4>}
		</div>
	);
}

export default SignIn;
