"use client";

import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";

import "./css/birthday-note.css";

type Props = {};

function BirthdayGift({}: Props) {
	const [showConfetti, setShowConfetti] = useState(false);

	return (
		<div className="birthday-note">
			<Confetti
				width={window.innerWidth}
				height={window.innerHeight}
				numberOfPieces={700}
				recycle={false}
				initialVelocityX={10}
				initialVelocityY={10}
			/>
			<p>To my Birthday Girl:</p>
			<p>Happy birthday, many returns of the day, etc. etc. All that stuff.</p>
			<p>
				Ok I had a completely different idea for this app and it would've been a lot cooler
				if I actually knew how to design stuff (I apologize for the bad css). And like
				overall it didnt reallyyy turn out the way I wanted to but it is what it is. So I
				hope you liked it :).
			</p>
			<p>
				Spending this last year with you has been beyond amazing. You bring so much joy to
				my life. Talking to you about anything makes my day so much better. And I know it
				sounds silly but whenever I see that message icon saying "Kamalini," theres a light
				that turns on inside because I think to myself "yay I get to talk to my girlfriend."
				It really is a highlight of my day. Today I wanted thank you for all the moments we
				shared and memories we created together. I really enjoy spending every second I can
				with you.
			</p>
			<p>
				You just have 1 more year left. Just hold on a bit longer. I promise you senior year
				goes by so fast. Just grind for a tiny bit longer.
			</p>
			<p>
				And while you have to still focus on college apps, please remember that this is your
				last year of gooning because next year you'll turn 18 and life becomes more serious.
				So I really hope you get the chance to have as much fun as possible with your
				friends and family. I wish I could be with you this year and spend time with you
				right by your side, but I'll be like 600 miles away :(. But remember you can call me
				anytime because I'll always have time for you. And I hope we grow even closer.
			</p>
			<p>
				I'm wishing you the best of luck in everything this coming year: college apps,
				school, life, robotics, whatever it may be. I know you'll do great in anything you
				put your mind to.
			</p>
			<p>And happy birthday once again to the most beautiful girl I know.</p>
			<p>
				Sending you endless smiles on your birthday and beyond,
				<br /> Joel
			</p>
		</div>
	);
}

export default BirthdayGift;
