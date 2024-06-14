import { cookies } from "next/headers";
import { useAuthContext } from "../../context/authContext";
import { redirect } from "next/navigation";
import TypingBox from "@/components/TypingBox";
import TypingComponent from "@/components/TypingComponent";
import GoodTypingComponent from "@/components/GoodTypingComponent";

import "../../components/css/main-page.css";
import Timer from "@/components/Timer";

export default function Profile() {
	const session = cookies().get("user_id")?.value || null;

	return (
		<>
			{session ? (
				// <TypingComponent />
				<div className="parent-container">
					<Timer targetDate={"June 15, 2024 00:00:00"} session={session} />
				</div>
			) : (
				<>
					<p>sign in</p>
				</>
			)}
		</>
	);
}
