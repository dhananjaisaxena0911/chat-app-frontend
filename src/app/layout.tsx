// app/layout.tsx (Server Component)
import "./globals.css";
import { ReactNode } from "react";
import {Toaster} from "react-hot-toast"
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Toaster position="top-right"/>
        {children}
        </body>
    </html>
  );
}
