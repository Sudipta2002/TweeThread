import { ClerkProvider } from "@clerk/nextjs"
import {Inter} from 'next/font/google';
import '../globals.css';
import {dark} from '@clerk/themes';
export const metadata = {
    title:'Auth',
    desciption:'A Next.js 13 Meta Threads Application'
}
const inter = Inter({subsets:["latin"]})
// const inter = Inter
export default function RootLayout({children}:{children:React.ReactNode}){
    return (
        <ClerkProvider
            appearance={{
                baseTheme: dark
            }}>
            <html lang="en">
                <body className={`${inter.className} bg-dark-1`}>
                    <div className="flex justify-center items-center w-full mt-14 min-h-min">
                        {children}
                    </div>
                </body>
            </html>
        </ClerkProvider>
    );
}