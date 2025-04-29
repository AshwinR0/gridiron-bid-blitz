import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Gridiron Bid Blitz",
    description: "A fantasy football auction platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-gradient-to-br from-theme-gradient-start via-theme-gradient-mid to-theme-gradient-end">
                    <div className="fixed inset-0 bg-theme-dark/50 backdrop-blur-sm -z-10" />
                    <NavBar />
                    <main className="container mx-auto px-4 py-8 relative z-10">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}