import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuthContext } from "../context/authContext";
import SignIn from "@/components/SignIn";
import { cookies } from "next/headers";

export default function AuthForm() {
	const session = cookies().get("user_id")?.value || null;

	return (
		<div>
			<SignIn session={session} />
		</div>
	);
}
