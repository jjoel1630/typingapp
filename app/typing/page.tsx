import { cookies } from "next/headers";
import { useAuthContext } from "../../context/authContext";
import { redirect } from "next/navigation";
import TypingBox from "@/components/TypingBox";
import TypingComponent from "@/components/TypingComponent";

export default function Profile() {
	const session = cookies().get("user_id")?.value || null;

	if (!session) redirect("/");

	return <TypingComponent />;
}
