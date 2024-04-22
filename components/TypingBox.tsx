"use client";

import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import "./css/typing.css";
import { paragraph } from "../lib/paragraphs/paragraphs";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

type Props = {};

const addTest = async (raw: number, wpm: number, accuracy: number, ratioChars: string) => {
	try {
		const docRef = await addDoc(collection(db, "testInfo"), {
			wpm,
			raw,
			accuracy,
			ratioChars,
		});
		console.log("Added data to db");
	} catch (err) {
		console.log(err);
	}
};

const isLetter = (str: string) => {
	return str.length === 1 && str.match(/[a-z]/i);
};

function TypingBox({}: Props) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const divRef = useRef<HTMLDivElement | null>(null);
	const [typingChars, setTypingChars] = useState<string>("");
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [classLists, setClassLists] = useState<string[]>([]);
	const [isComplete, setIsComplete] = useState(false);
	const [correctChars, setCorrectChars] = useState<number>(0);

	const [rawWPM, setRawWPM] = useState<number>(0);
	const [WPM, setWPM] = useState<number>(0);
	const [accuracy, setAccuracy] = useState<number>(0);
	const [ratioChars, setRatioChars] = useState<string>("");

	const [startTime, setStartTime] = useState<number | null>(null);
	const [currentTime, setCurrentTime] = useState<number>(0);

	const inputRefCallback = (e: any) => {
		if (isLetter(e.key)) startGame(e);
	};

	const startGame = (e: any) => {
		console.log("Game Started");
		setIsComplete(false);
		inputRef.current?.removeEventListener("keydown", inputRefCallback);
		startTimer();
	};

	const startTimer = () => {
		setStartTime(Date.now());
	};

	const toggleTyping = () => {
		inputRef.current?.focus();
		inputRef.current?.addEventListener("keydown", inputRefCallback);
	};

	const setStates = useCallback(() => {}, []);

	const initClassList = () => {
		const len: number = paragraph[0].split("").length;
		let temp: string[] = [];
		for (let i = 0; i < len; ++i) {
			temp = [...temp, "letter"];
		}
		temp[0] = "active";
		setClassLists(temp);
	};

	const stopGame = useCallback(() => {
		console.log("Game Stopped");
		setStartTime(null);
		setIsComplete(true);
		setCurrentTime(0);
		setCurrentIndex(0);

		setWPM((typingChars.length / 5 / 30) * 60 * (correctChars / typingChars.length));
		setRawWPM((typingChars.length / 5 / 30) * 60);
		setAccuracy((correctChars / typingChars.length) * 100);
		setRatioChars(`${correctChars} / ${typingChars.length - correctChars}`);
	}, [correctChars, typingChars.length]);

	const restartGame = () => {
		console.log("Game Restarted");
		setStartTime(null);
		setIsComplete(false);
		setCurrentTime(0);
		setCurrentIndex(0);
	};

	const listenTab = (e: any) => {
		if (e.key === "Tab") {
			e.preventDefault();
			restartGame();
			initClassList();
		}
	};

	useEffect(() => {
		document.addEventListener("keydown", listenTab);
	});

	useEffect(() => {
		initClassList();
	}, [isComplete]);

	useEffect(() => {
		if (currentTime >= 5) stopGame();
	}, [currentTime, typingChars.length, correctChars, stopGame]);

	useEffect(() => {
		const addData = async () => {
			const data = await addTest(rawWPM, WPM, accuracy, ratioChars);
		};

		if (isComplete) addData();
	}, [WPM, accuracy, ratioChars, rawWPM, isComplete]);

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;

		if (startTime !== null) {
			interval = setInterval(() => {
				setCurrentTime((prevTime) => prevTime + 1);
			}, 1000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [startTime]);

	const markLetters = (e: any) => {
		const validateType = (
			spans: string[],
			typedLetter: string,
			curIndex: number,
			curLetter: string
		) => {
			const curSpan = spans[curIndex];
			if (typedLetter === curLetter) {
				spans[curIndex] = "correct";
				setCorrectChars(correctChars + 1);
			} else spans[curIndex] = "incorrect";

			setClassLists(spans);
		};

		const typedLetter = e.nativeEvent.data;
		let idx = currentIndex;

		const newClassLists = [...classLists];

		if (idx >= paragraph[0].split("").length) return; // game end
		if (typedLetter === null) {
			if (idx > 0) {
				newClassLists[idx--] = "";
				newClassLists[idx] = "active";
			}
		} else {
			validateType(newClassLists, typedLetter, idx, paragraph[0].split("")[idx]);
			++idx;
			if (idx >= paragraph[0].split("").length) return; // game end
			newClassLists[idx] = "active";
		}

		setClassLists(newClassLists);
		setCurrentIndex(idx);
		let characters = typedLetter === null ? typingChars : typingChars + typedLetter;
		setTypingChars(characters);
	};

	return (
		<div className="container" ref={divRef}>
			{isComplete ? (
				<div className="results">
					<p className="final-raw">{rawWPM}</p>
					<p className="final-accuracy">{accuracy}%</p>
					<p className="final-wpm">{WPM}</p>
					<p className="final-chars">
						{correctChars} / {typingChars.length - correctChars}
					</p>
					<button onClick={() => setIsComplete(false)}>retake</button>
				</div>
			) : (
				<div className="type-test">
					<input
						type="text"
						className="text-input"
						ref={inputRef}
						onChange={markLetters}
					/>
					<div className="text-container">
						<p className="text-paragraph" onClick={toggleTyping}>
							{paragraph[0].split("").map((val: string, idx: number) => {
								return (
									<span className={`letter ${classLists[idx]}`} key={idx}>
										{val}
									</span>
								);
							})}
						</p>
					</div>
					<div className="stats">
						<p className="current-wpm">
							{currentTime > 0 ? (typingChars.length / currentTime / 5) * 60 : 0}
						</p>
						<p className="current-timer">{currentTime}</p>
					</div>
				</div>
			)}
		</div>
	);
}

export default TypingBox;
