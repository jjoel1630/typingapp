import { cookies } from "next/headers";
import { useAuthContext } from "../../context/authContext";
import { redirect } from "next/navigation";
import ProfileDisplay from "@/components/ProfileDisplay";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function Profile() {
	const session = cookies().get("user_id")?.value || null;

	if (!session) redirect("/");

	return <ProfileDisplay />;
}
