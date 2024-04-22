"use client";

import { db } from "@/lib/firebase/config";
import { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { collection, doc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";

type Props = {};

function Profile({}: Props) {
	const [testData, setTestData] = useState<any>();
	const [maxWPM, setMaxWPM] = useState(0);

	useEffect(() => {
		const getTests = async () => {
			try {
				const data = await getDocs(collection(db, "testInfo"));
				let mx = 0;
				data.docs.forEach((elem) => {
					mx = Math.max(elem.data().wpm);
				});
				setTestData(data.docs);
				setMaxWPM(mx);
			} catch (err) {
				console.log(err);
			}
		};

		getTests();
	}, []);

	return (
		<div>
			{!testData ? (
				<p>loading...</p>
			) : (
				<div>
					<div>Max: {maxWPM}</div>
					{testData.map((doc: any, idx: number) => {
						const dt = doc.data();
						return (
							<div key={idx}>
								<p>{dt.wpm}</p>
								<p>{dt.accuracy}</p>
								<p>{dt.raw}</p>
								<p>{dt.ratioChars}</p>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default Profile;
