"use client";

import React from "react";
import "./css/typing.css";
import { paragraph } from "../lib/paragraphs/paragraphs";

type Props = {};

function TypingBox({}: Props) {
	return (
		<div className="container">
			<div className="type-test">
				<input type="text" className="text-input" />
				<div className="text-container">
					<p className="text-paragraph">
						{paragraph[0].split("").map((val: string, idx: number) => {
							return <span key={idx}>{val}</span>;
						})}
					</p>
				</div>
				<div className="stats">
					<p className="current-wpm"></p>
					<p className="current-timer"></p>
				</div>
			</div>
			<div className="results">
				<p className="final-wpm"></p>
				<p className="final-accuracy"></p>
				<p className="final-raw"></p>
				<p className="final-chars"></p>
			</div>
		</div>
	);
}

export default TypingBox;
