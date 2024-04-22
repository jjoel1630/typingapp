"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { paragraph, words } from "../lib/paragraphs/paragraphs";

import "./css/typing.css";

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

function TypingComponent({}: Props) {
	const inputRef = useRef<HTMLInputElement | null>(null);

	const [typing, setTyping] = useState(true);
	const [reset, setReset] = useState(false);
	const [startTime, setStartTime] = useState<number | null>(null);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [gameModeTime, setGameModeTime] = useState(15);

	const [classLists, setClassLists] = useState<string[][]>([]);
	const [wordArray, setWordArray] = useState<string[]>([]);
	const [typedWordArray, setTypedWordArray] = useState<string[]>([]);
	const [randomParagraphIndex, setRandomParagraphIndex] = useState(0);

	const [idxs, setIdxs] = useState<number[]>([0, 0]);
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
		let p = "";
		for (let i = 0; i < 150; ++i) {
			p += `${words[Math.floor(Math.random() * words.length)]} `;
		}

		const wordLen: number = p.split(" ").length;
		let temp: string[][] = [];
		for (let i = 0; i < wordLen; ++i) {
			let t: string[] = new Array(p.split(" ")[i].length).fill("");
			temp = [...temp, t];
		}
		temp[0][0] = ACTIVE_CLASS;
		setClassLists(temp);
		setWordArray(p.split(" "));
		// console.log("classlist function");
	}, []);

	const initialize = useCallback(() => {
		// console.log("Initialize function");
		setIdxs([0, 0]);
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

	const resetGame = useCallback(() => {
		// console.log("Game Reset");
		setStartTime(null);
		setCurrentTime(0);
		initialize();
	}, [initialize]);

	const inputRefCallback = useCallback(
		(e: any) => {
			if (isLetter(e.key)) {
				// console.log("Inputref callback");
				inputRef.current?.removeEventListener("keydown", inputRefCallback);
				startGame();
			}
		},
		[startGame]
	);

	const documentRefCallback = useCallback(
		(e: any) => {
			if (e.key === "Tab") {
				// console.log("Documentref reset");
				e.preventDefault();
				resetGame();
				setTyping(true);
				setReset(true);
			}
		},
		[resetGame]
	);

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
		let [wIdx, cIdx] = idxs;
		let [correct, incorrect, extra, missing] = stats;
		let [rawCorrect, rawIncorrect] = rawStats;

		let newClassLists = [...classLists];
		let newTypedWordArray = [...typedWordArray];
		let newWordArray = [...wordArray];
		const wordLength = wordArray[wIdx].length;

		// console.log("before", cIdx);
		// console.log("before", newClassLists[wIdx]);
		// console.log("before", newTypedWordArray);

		if (wIdx >= newTypedWordArray.length) newTypedWordArray = [...newTypedWordArray, ""];

		if (typedLetter === " " && cIdx !== 0) {
			if (cIdx === wordLength) ++correct;
			else {
				for (let i = cIdx; i < wordLength; ++i) {
					newClassLists[wIdx][i] = MISSING_CLASS;
					newTypedWordArray[wIdx] += "#";
					++missing;
				}
				++incorrect;
				++correct;
				++rawIncorrect;
				++rawCorrect;
			}
			++wIdx;
			cIdx = 0;
			newWordArray = [...newWordArray, `${words[Math.floor(Math.random() * words.length)]} `];
			newClassLists = [
				...newClassLists,
				new Array(newWordArray[newWordArray.length - 1].length).fill(""),
			];

			newClassLists[wIdx][cIdx] = ACTIVE_CLASS;
		}

		if (typedLetter !== null && isLetter(typedLetter)) {
			if (cIdx >= wordArray[wIdx].length) {
				++incorrect;
				++rawIncorrect;
				++extra;
				newClassLists[wIdx] = [...newClassLists[wIdx], EXTRA_CLASS];
				++cIdx;
			} else if (wordArray[wIdx][cIdx] === typedLetter) {
				++correct;
				++rawCorrect;
				newClassLists[wIdx][cIdx] = CORRECT_CLASS;
				++cIdx;
				if (cIdx < wordArray[wIdx].length) newClassLists[wIdx][cIdx] = ACTIVE_CLASS;
			} else if (wordArray[wIdx][cIdx] !== typedLetter) {
				++incorrect;
				++rawIncorrect;
				newClassLists[wIdx][cIdx] = INCORRECT_CLASS;
				++cIdx;
				if (cIdx < wordArray[wIdx].length) newClassLists[wIdx][cIdx] = ACTIVE_CLASS;
			}
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

		// console.log("after", cIdx);
		// console.log("after", newClassLists[wIdx]);
		// console.log("after", newTypedWordArray);

		setIdxs([wIdx, cIdx]);
		setWordArray(newWordArray);
		setStats([correct, incorrect, extra, missing]);
		setRawStats([rawCorrect, rawIncorrect]);
		setClassLists(newClassLists);
		setTypedWordArray(newTypedWordArray);
	};

	return (
		<div className="type-test">
			{typing ? (
				<>
					<button onClick={() => setGameModeTime(15)}>15 seconds</button>
					<button onClick={() => setGameModeTime(30)}>30 seconds</button>
					<input
						type="text"
						className="text-input"
						ref={inputRef}
						onChange={markLetters}
					/>
					<div className="text-container">
						<p className="text-paragraph" onClick={focusInput}>
							{wordArray.map((val: string, idx: number) => {
								return (
									<span key={idx}>
										{val.split("").map((charac: string, charIdx: number) => {
											return (
												<span
													className={`${LETTER_CLASS} ${classLists[idx][charIdx]}`}
													key={charIdx}>
													{charac}
												</span>
											);
										})}
										{typedWordArray[idx]
											?.split("")
											.map((charac: string, charIdx: number) => {
												if (
													charIdx >= wordArray[idx].length &&
													wordArray[idx] !== "#"
												) {
													return (
														<span
															className={`${LETTER_CLASS} ${EXTRA_CLASS}`}
															key={charIdx}>
															{charac}
														</span>
													);
												}
											})}
										<span className={`${LETTER_CLASS}`} key={idx}>
											{" "}
										</span>
									</span>
								);
							})}
						</p>
					</div>
					<div className="stats">
						<p className="current-timer">{gameModeTime - currentTime}</p>
					</div>
				</>
			) : (
				<div className="stats">
					<p className="final-raw">{raw}</p>
					<p className="final-wpm">{wpm}</p>
					<p className="final-accuracy">{accuracy}</p>
					<p className="final-characters">
						{stats[0]} / {stats[1]} / {stats[2]} / {stats[3]}
					</p>
				</div>
			)}
		</div>
	);
}

export default TypingComponent;
