import { Inter } from "next/font/google";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = cookies().get("user_id")?.value || null;

	return (
		<html lang="en">
			<body className={inter.className}>{children}</body>
		</html>
	);
}
