"use client";

import React, { useEffect, useState } from "react";
import GoodTypingComponent from "./GoodTypingComponent";
import BirthdayComponent from "./BirthdayComponent";

type Props = {
	targetDate: string;
	session: any;
};

function Timer({ targetDate, session }: Props) {
	const [timeLeft, setTimeLeft] = useState("");
	const [isSessionActive, setIsSessionActive] = useState(true); // State to track if the session is active

	useEffect(() => {
		const target = new Date(targetDate).getTime();

		// Update the countdown every second
		const interval = setInterval(() => {
			const now = new Date().getTime();
			const difference = target - now;

			if (difference < 0) {
				clearInterval(interval);
				setTimeLeft("00:00:00");
				setIsSessionActive(false); // Set session as inactive when countdown reaches zero
				return;
			}

			const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((difference % (1000 * 60)) / 1000);

			// Format time left as HH:MM:SS
			setTimeLeft(`${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}`);
		}, 1000);

		// Clear interval on component unmount
		return () => clearInterval(interval);
	}, [targetDate]);

	// Helper function to add leading zero if necessary
	function padTime(number: number) {
		return number < 10 ? "0" + number : number;
	}

	return (
		<>
			{isSessionActive ? (
				<>
					<p className="timer">{timeLeft}</p>
					<GoodTypingComponent session={session} />
				</>
			) : (
				<BirthdayComponent /> // Render this component when the session is not active
			)}
		</>
	);
}

export default Timer;
