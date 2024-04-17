import * as firebaseAdmin from "firebase-admin";

// get this JSON from the Firebase board
// you can also store the values in environment variables

if (!firebaseAdmin.apps.length) {
	firebaseAdmin.initializeApp({
		credential: firebaseAdmin.credential.cert({
			// privateKey: serviceAccount.private_key,
			// clientEmail: serviceAccount.client_email,
			projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		}),
		databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
	});
}

export default firebaseAdmin;
