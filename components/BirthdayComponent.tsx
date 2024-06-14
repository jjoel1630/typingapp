"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { words } from "../lib/paragraphs/filtered";
import { birthday } from "../lib/paragraphs/birthday";

import "./css/birthday-typing.css";
import BirthdayGift from "./BirthdayGift";

type Props = {};

const isLetter = (str: string) => {
	return str.length === 1 && str.match(/[a-z]/i);
};

const LETTER_CLASS = "letter";
const ACTIVE_CLASS = "active";
const CORRECT_CLASS = "correct";
const MISSING_CLASS = "missing";
const INCORRECT_CLASS = "incorrect";
const EXTRA_CLASS = "extra";

function BirthdayComponent({}: Props) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const [done, setDone] = useState<boolean>(false);

	const [typing, setTyping] = useState(true);
	const [reset, setReset] = useState(false);
	const [startTime, setStartTime] = useState<number | null>(null);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [gameModeTime, setGameModeTime] = useState(15);

	const [classLists, setClassLists] = useState<string[][]>([]);
	const [wordArray, setWordArray] = useState<string[]>([]);
	const [typedWordArray, setTypedWordArray] = useState<string[]>([]);
	const [runningCharIdx, setRunningCharIdx] = useState<number[]>([0, 0, 0]);

	const [idxs, setIdxs] = useState<number[]>([0, 0, 41]);
	const [stats, setStats] = useState([0, 0, 0, 0]);
	const [rawStats, setRawStats] = useState([0, 0]);

	const [accuracy, setAccuracy] = useState(0);
	const [raw, setRaw] = useState(0);
	const [wpm, setWpm] = useState(0);

	const calcFinalStats = useCallback(() => {
		const time = gameModeTime / 60;
		const word = (rawStats[0] + rawStats[1]) / 5;
		setAccuracy((rawStats[0] / (rawStats[0] + rawStats[1])) * 100);
		setRaw(word / time);
		setWpm((word / time) * (rawStats[0] / (rawStats[0] + rawStats[1])));
	}, [gameModeTime, rawStats]);

	const initClassList = useCallback(() => {
		let p = birthday;

		const wordLen: number = p.split(" ").length;
		let temp: string[][] = [];
		for (let i = 0; i < wordLen; ++i) {
			let t: string[] = new Array(p.split(" ")[i].length).fill("");
			temp = [...temp, t];
		}

		temp[0][0] = ACTIVE_CLASS;
		setClassLists(temp);
		const arr = p.split(" ");
		setWordArray(arr);
	}, []);

	const initialize = useCallback(() => {
		// console.log("Initialize function");
		setIdxs([0, 0, 41]);
		setStats([0, 0, 0, 0]);
		setRawStats([0, 0]);
		setTypedWordArray([]);
		initClassList();
	}, [initClassList]);

	const startGame = useCallback(() => {
		// console.log("Game Started");
		// initialize();
		setTyping(true);
		setReset(false);
		// initClassList();
		setStartTime(Date.now());
	}, []);

	const stopGame = useCallback(() => {
		// console.log("Game Stopped");
		setTyping(false);
		setStartTime(null);
		setCurrentTime(0);
		calcFinalStats();
	}, [calcFinalStats]);

	const inputRefCallback = useCallback(
		(e: any) => {
			if (isLetter(e.key)) {
				// console.log("input ref callback");
				inputRef.current?.removeEventListener("keydown", inputRefCallback);
				startGame();
			}
		},
		[startGame]
	);

	const documentRefCallback = useCallback((e: any) => {
		if (e.key === "Tab") {
			// console.log("Documentref reset");
			e.preventDefault();
		}
	}, []);

	const focusInput = () => {
		inputRef.current?.focus();
	};

	useEffect(() => {
		initialize();
		inputRef.current?.focus();
		inputRef.current?.addEventListener("keydown", inputRefCallback);
		// console.log("Initialize useeffect");
	}, [inputRefCallback, initialize]);

	useEffect(() => {
		if (reset) {
			inputRef.current?.focus();
			inputRef.current?.addEventListener("keydown", inputRefCallback);
			// console.log("Inputref focus useeffect");
		}
	}, [inputRefCallback, reset]);

	useEffect(() => {
		document.addEventListener("keydown", documentRefCallback);
	}, [documentRefCallback]);

	useEffect(() => {
		if (currentTime >= gameModeTime) stopGame();
	}, [currentTime, gameModeTime, stopGame]);

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
		const typedLetter = e.nativeEvent.data;
		let [wIdx, cIdx, idxPx] = idxs;
		let [correct, incorrect, extra, missing] = stats;
		let [rawCorrect, rawIncorrect] = rawStats;
		let [rCIdx, wCIdx, wCN] = runningCharIdx;

		if (wIdx === wordArray.length - 1 && cIdx === wordArray[wIdx].length - 1) {
			if (!done) setDone(true);
			return;
		}

		let newClassLists = [...classLists];
		let newTypedWordArray = [...typedWordArray];
		let newWordArray = [...wordArray];
		const wordLength = wordArray[wIdx].length;

		if (wIdx >= newTypedWordArray.length) newTypedWordArray = [...newTypedWordArray, ""];

		if (typedLetter === " " && cIdx !== 0 && cIdx === wordLength) {
			rCIdx += newWordArray[wIdx].length;
			++wIdx;
			cIdx = 0;

			newWordArray = [...newWordArray];
			newClassLists = [...newClassLists];

			newClassLists[wIdx][cIdx] = ACTIVE_CLASS;
		}

		if (
			((typedLetter !== null && isLetter(typedLetter)) ||
				typedLetter === "." ||
				typedLetter === ",") &&
			wordArray[wIdx][cIdx] === typedLetter
		) {
			++correct;
			++rawCorrect;
			newClassLists[wIdx][cIdx] = CORRECT_CLASS;
			++cIdx;
			if (cIdx < wordArray[wIdx].length) newClassLists[wIdx][cIdx] = ACTIVE_CLASS;
			newTypedWordArray[wIdx] += typedLetter;
		}

		if (typedLetter === null && !(wIdx === 0 && cIdx === 0)) {
			newClassLists[wIdx][cIdx] = "";
			newTypedWordArray[wIdx] = newTypedWordArray[wIdx].substring(
				0,
				newTypedWordArray[wIdx].length - 1
			);

			if (cIdx === 0) {
				--correct;
				--wIdx;
				cIdx = newTypedWordArray[wIdx].length - 1;
				while (
					newTypedWordArray[wIdx][cIdx] === "#" &&
					cIdx > 0 &&
					newTypedWordArray[wIdx][cIdx - 1] === "#"
				) {
					newTypedWordArray[wIdx] = newTypedWordArray[wIdx].substring(
						0,
						newTypedWordArray[wIdx].length - 1
					);
					newClassLists[wIdx][cIdx] = "";
					--missing;
					--cIdx;
				}
				if (newTypedWordArray[wIdx][newTypedWordArray[wIdx].length - 1] === "#") {
					--missing;
					--incorrect;
				}
				newTypedWordArray[wIdx] = newTypedWordArray[wIdx].substring(
					0,
					newTypedWordArray[wIdx].length - 1
				);
			} else {
				--cIdx;
				if (newClassLists[wIdx][cIdx] === EXTRA_CLASS) {
					--incorrect;
					--extra;
				}
			}

			if (newClassLists[wIdx][cIdx] === INCORRECT_CLASS) --incorrect;
			if (newClassLists[wIdx][cIdx] === CORRECT_CLASS) --correct;
			newClassLists[wIdx][cIdx] = ACTIVE_CLASS;
		}

		setIdxs([wIdx, cIdx, idxPx + 20]);
		setRunningCharIdx([rCIdx, wCIdx, wCN]);
		setWordArray(newWordArray);
		setStats([correct, incorrect, extra, missing]);
		setRawStats([rawCorrect, rawIncorrect]);
		setClassLists(newClassLists);
		setTypedWordArray(newTypedWordArray);
	};

	return (
		<>
			{!done ? (
				<div className="birthday-container">
					<div id="birthday-main-typing">
						<div className="birthday-main-typing-container">
							<div className="birthday-text-bar">
								<div className="birthday-circle-container">
									<div className="birthday-circle"></div>
									<div className="birthday-circle"></div>
									<div className="birthday-circle"></div>
								</div>
								<div className="birthday-name-container">
									<p>User</p>
								</div>
							</div>
							<div className="birthday-typing-section">
								<>
									<input
										type="text"
										className="birthday-text-input"
										ref={inputRef}
										onChange={markLetters}
									/>
									<div className="birthday-text-container">
										<div
											className="birthday-text-paragraph"
											onClick={focusInput}
											ref={containerRef}>
											{wordArray.map((val: string, idx: number) => {
												return (
													<div key={idx} className="birthday-word">
														{val
															.split("")
															.map(
																(
																	charac: string,
																	charIdx: number
																) => {
																	return (
																		<span
																			className={`${LETTER_CLASS} ${classLists[idx][charIdx]}`}
																			key={charIdx}>
																			{charac}
																		</span>
																	);
																}
															)}
														<span
															className={`${LETTER_CLASS}`}
															key={idx}>
															{" "}
														</span>
													</div>
												);
											})}
										</div>
									</div>
								</>
							</div>
						</div>
					</div>
				</div>
			) : (
				<BirthdayGift />
			)}
		</>
	);
}

export default BirthdayComponent;
