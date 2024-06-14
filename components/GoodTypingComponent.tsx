"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { words } from "../lib/paragraphs/filtered";

import "./css/good-typing.css";

type Props = {
	session: any;
};

const isLetter = (str: string) => {
	return str.length === 1 && str.match(/[a-z]/i);
};

const LETTER_CLASS = "letter";
const ACTIVE_CLASS = "active";
const CORRECT_CLASS = "correct";
const MISSING_CLASS = "missing";
const INCORRECT_CLASS = "incorrect";
const EXTRA_CLASS = "extra";

function GoodTypingComponent({ session }: Props) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const [listenerAdded, setListenerAdded] = useState(false);

	const [typing, setTyping] = useState(true);
	const [reset, setReset] = useState(false);
	const [startTime, setStartTime] = useState<number | null>(null);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [gameModeTime, setGameModeTime] = useState(15);

	const [classLists, setClassLists] = useState<string[][]>([]);
	const [wordArray, setWordArray] = useState<string[]>([]);
	const [typedWordArray, setTypedWordArray] = useState<string[]>([]);
	const [runningCharIdx, setRunningCharIdx] = useState<number[]>([0, 0, 0]);
	const [randomParagraphIndex, setRandomParagraphIndex] = useState(0);

	const [lineEndWords, setLineEndWords] = useState<any[]>([]);
	const [skipIdx, setSkipIdx] = useState<number>(1);

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
		console.log("init class list");

		let p = "";
		for (let i = 0; i < 40; ++i) {
			p += `${words[Math.floor(Math.random() * words.length)]} `;
		}

		const lines = [];
		let currentLine: any[] = [];
		let currentLength = 0;

		p.split(" ").forEach((word: string) => {
			if (currentLength + word.length > 50) {
				lines.push(currentLine);
				currentLine = [];
				currentLength = 0;
			}
			currentLine.push(word);
			currentLength += word.length + 1;
		});

		if (currentLine.length > 0) lines.push(currentLine);

		let newP = "";
		for (let i = 0; i < 4; ++i) {
			for (let j = 0; j < lines[i].length; ++j) {
				newP += `${lines[i][j]} `;
			}
		}

		// console.log(newP);
		// console.log(lines);

		const wordLen: number = p.split(" ").length;
		let temp: string[][] = [];
		for (let i = 0; i < wordLen; ++i) {
			let t: string[] = new Array(p.split(" ")[i].length).fill("");
			temp = [...temp, t];
		}
		temp[0][0] = ACTIVE_CLASS;
		setClassLists(temp);
		const arr = p.split(" ");
		arr.pop();
		setWordArray(arr);
		// console.log("classlist function");
	}, []);

	const initialize = useCallback(() => {
		console.log("initialize");

		// console.log("Initialize function");
		setIdxs([0, 0, 41]);
		setStats([0, 0, 0, 0]);
		setRawStats([0, 0]);
		setTypedWordArray([]);
		initClassList();
	}, [initClassList]);

	const startGame = useCallback(() => {
		console.log("start game");
		// console.log("Game Started");
		// initialize();
		setTyping(true);
		setReset(false);
		// initClassList();
		setStartTime(Date.now());
	}, []);

	const stopGame = useCallback(() => {
		console.log("stop game");

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
			console.log("in callback");
			if (isLetter(e.key)) {
				// console.log("Inputref callback");
				inputRef.current?.removeEventListener("keydown", inputRefCallback);
				setListenerAdded(false);
				startGame();
			}
		},
		[startGame]
	);

	const documentRefCallback = useCallback((e: any) => {
		if (e.key === "Tab") {
			// console.log("Documentref reset");
			e.preventDefault();
			window.location.reload();
			// setTyping(true);
			// setStartTime(null);
			// setCurrentTime(0);
			// initialize();

			// inputRef.current?.focus();
			// inputRef.current?.addEventListener("keydown", inputRefCallback);
			// setListenerAdded(true);
		}
	}, []);

	const focusInput = () => {
		inputRef.current?.focus();
	};

	useEffect(() => {
		console.log("use effect 181");
		initialize();
		inputRef.current?.focus();
		inputRef.current?.addEventListener("keydown", inputRefCallback);
		setListenerAdded(true);
		// console.log("Initialize useeffect");
	}, [inputRefCallback, initialize]);

	useEffect(() => {
		if (reset) {
			console.log("use effect 189");
			inputRef.current?.focus();
			inputRef.current?.addEventListener("keydown", inputRefCallback);
			setListenerAdded(true);
			// console.log("Inputref focus useeffect");
		}
	}, [inputRefCallback, reset]);

	useEffect(() => {
		console.log("use effect document event");
		document.addEventListener("keydown", documentRefCallback);
	}, [documentRefCallback]);

	useEffect(() => {
		console.log("use effect stop game");
		if (currentTime >= gameModeTime) {
			console.log("game stopped");
			stopGame();
		}
	}, [currentTime, gameModeTime, stopGame]);

	useEffect(() => {
		console.log("use effect interval");

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

	const calcEndLineWords = (): any => {
		if (containerRef.current) {
			const containerWidth = containerRef.current.offsetWidth;

			// Setup a temporary container for measurement
			const tempContainer = document.createElement("div");
			tempContainer.style.position = "absolute";
			// tempContainer.style.visibility = "hidden";
			tempContainer.style.height = "auto";
			tempContainer.style.width = "auto";
			tempContainer.style.margin = "33px";
			tempContainer.style.whiteSpace = "nowrap"; // Keeping it nowrap because of flex
			tempContainer.style.fontSize = "2em";
			tempContainer.style.fontFamily = `'Roboto Mono', monospace`;
			tempContainer.style.display = "flex"; // Using flex to mimic your setup
			tempContainer.style.flexWrap = "nowrap"; // Ensure no wrapping in temporary div

			document.body.appendChild(tempContainer);

			let currentLineWidth = 0;
			let lastWordIndex = -1;

			let linesTemp: any[] = lineEndWords;

			wordArray.forEach((word, index) => {
				// Create a div for each word
				const wordDiv = document.createElement("div");
				wordDiv.style.margin = "5px 10px 5px 10px"; // Add margin to each word
				let w: string = "";
				for (let i = 0; i < word.length; ++i) {
					w += `<span style="margin: 0.25px">${word[i]}</span>`;
				}
				wordDiv.innerHTML = w; // Set text
				tempContainer.appendChild(wordDiv); // Add word to container

				const wordWidth = wordDiv.offsetWidth;

				// Check if adding this word exceeds the container width
				if (currentLineWidth + wordWidth > containerWidth) {
					// console.log("current word:", word, "current width:", currentLineWidth);
					if (lastWordIndex !== -1) {
						linesTemp = [...linesTemp, [wordArray[lastWordIndex], lastWordIndex]];
					}
					currentLineWidth = wordWidth + parseFloat("20"); // Reset line width
				} else {
					currentLineWidth += wordWidth + parseFloat("20");
				}
				lastWordIndex = index;

				// console.log(currentLineWidth);

				// Clean up each word div
				tempContainer.removeChild(wordDiv);
			});

			// Clean up the entire temporary container
			document.body.removeChild(tempContainer);

			// Handle the last line
			// console.log(linesTemp);
			// console.log(wordArray);

			return linesTemp[skipIdx];
		}
	};

	const markLetters = (e: any) => {
		const typedLetter = e.nativeEvent.data;
		let [wIdx, cIdx, idxPx] = idxs;
		let [correct, incorrect, extra, missing] = stats;
		let [rawCorrect, rawIncorrect] = rawStats;
		let [rCIdx, wCIdx, wCN] = runningCharIdx;

		// console.log("after", idxs);
		// console.log("after", wIdx);

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
			rCIdx += newWordArray[wIdx].length;
			// ++wCN;
			++wIdx;
			cIdx = 0;

			newWordArray = [...newWordArray, `${words[Math.floor(Math.random() * words.length)]} `];
			newClassLists = [
				...newClassLists,
				new Array(newWordArray[newWordArray.length - 1].length).fill(""),
			];

			const cELW = calcEndLineWords();
			// console.log(cELW);
			if (wIdx - 1 === cELW[1]) {
				wCIdx = wIdx;
				rCIdx = 0;
				wCN = 0;
				setSkipIdx(skipIdx + 2);
			}

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

		// console.log("after", idxPx);
		// console.log("after", newClassLists[wIdx]);
		// console.log("after", newTypedWordArray);

		setIdxs([wIdx, cIdx, idxPx + 20]);
		setRunningCharIdx([rCIdx, wCIdx, wCN]);
		setWordArray(newWordArray);
		setStats([correct, incorrect, extra, missing]);
		setRawStats([rawCorrect, rawIncorrect]);
		setClassLists(newClassLists);
		setTypedWordArray(newTypedWordArray);
	};

	function calculateLines(words: string[]) {
		const lines = [];
		let currentLine: any[] = [];
		let currentLength = 0;

		words.forEach((word: string) => {
			if (currentLength + word.length > 40) {
				lines.push(currentLine);
				currentLine = [];
				currentLength = 0;
			}
			currentLine.push(word);
			currentLength += word.length + 1; // +1 for space
		});

		if (currentLine.length > 0) {
			lines.push(currentLine);
		}

		return lines;
	}

	const lines = calculateLines(wordArray);

	return (
		<div className="container">
			<div className="grid">
				<div id="main-typing">
					<div className="main-typing-container">
						<div className="text-bar">
							<div className="circle-container">
								<div className="circle"></div>
								<div className="circle"></div>
								<div className="circle"></div>
							</div>
							<div className="name-container">
								<p>User</p>
							</div>
						</div>
						<div className="typing-section">
							{typing ? (
								<>
									<input
										type="text"
										className="text-input"
										ref={inputRef}
										onChange={markLetters}
									/>
									<div className="text-container">
										<div
											className="text-paragraph"
											onClick={focusInput}
											ref={containerRef}>
											{wordArray.map((val: string, idx: number) => {
												if (idx < runningCharIdx[1]) return "";
												return (
													<div key={idx} className="word">
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
														{typedWordArray[idx]
															?.split("")
															.map(
																(
																	charac: string,
																	charIdx: number
																) => {
																	if (
																		charIdx >=
																			wordArray[idx].length &&
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
							) : (
								<div className="final-stats">
									<p className="final-raw">Raw WPM: {Math.round(raw)}</p>
									<p className="final-wpm">WPM: {Math.round(wpm)}</p>
									<p className="final-accuracy">
										Accuracy: {Math.round(accuracy)}%
									</p>
									<p className="final-characters">
										{stats[0]} / {stats[1]} / {stats[2]} / {stats[3]}
										<div className="tooltip">
											<span>Correct</span>
											<span>Incorrect</span>
											<span>Extra</span>
											<span>Missed</span>
										</div>
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
				<div id="keyboard">
					<div className="keyboard-container">
						<div className="keyboard">
							<div className="key-row">
								<span className="key medium special"></span>
								<span className="key">Q</span>
								<span className="key">W</span>
								<span className="key">E</span>
								<span className="key">R</span>
								<span className="key">T</span>
								<span className="key">Y</span>
								<span className="key">U</span>
								<span className="key">I</span>
								<span className="key">O</span>
								<span className="key">P</span>
								<span className="key special"></span>
							</div>
							<div className="key-row">
								<span className="key medium special"></span>
								<span className="key">A</span>
								<span className="key">S</span>
								<span className="key">D</span>
								<span className="key">F</span>
								<span className="key">G</span>
								<span className="key">H</span>
								<span className="key">J</span>
								<span className="key">K</span>
								<span className="key">L</span>
								<span className="key medium special"></span>
							</div>
							<div className="key-row">
								<span className="key extra-large special"></span>
								<span className="key">Z</span>
								<span className="key">X</span>
								<span className="key">C</span>
								<span className="key">V</span>
								<span className="key">B</span>
								<span className="key">N</span>
								<span className="key">M</span>
								<span className="key extra-large special"></span>
							</div>
							<div className="key-row">
								<span className="key special"></span>
								<span className="key special"></span>
								<span className="key special"></span>
								<span className="key extra-large">_</span>
								<span className="key special"></span>
								<span className="key special"></span>
							</div>
						</div>
					</div>
				</div>
				<div id="stats">
					<div className="stats-container">
						<h2>Time Control</h2>
						<div className="toggle-switch">
							<div
								className={`toggle-option ${gameModeTime === 15 ? "selected" : ""}`}
								onClick={() => setGameModeTime(15)}>
								15 sec
							</div>
							<div
								className={`toggle-option ${gameModeTime === 30 ? "selected" : ""}`}
								onClick={() => setGameModeTime(30)}>
								30 sec
							</div>
						</div>
						<div className="stats">
							<div className="stat-item">
								{/* <label>Time</label> */}
								<div className="stat-value">{gameModeTime - currentTime}</div>
							</div>
							{/* <div className="stat-item">
								<label>WPM</label>
								<div className="stat-value">{}</div>
							</div>
							<div className="stat-item">
								<label>Accuracy</label>
								<div className="stat-value">{accuracy}</div>
							</div> */}
						</div>
					</div>
				</div>
				<div id="mouse">
					<div className="mouse-container">
						<div className="mouse">
							<div className="mouse-body">
								<div className="mouse-button"></div>
							</div>
							<div className="mouse-cord"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default GoodTypingComponent;
