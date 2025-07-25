import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between w-full py-2 px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="PrepWithAhamed Logo" width={38} height={32} />
            <span className="text-2xl md:text-3xl font-semibold tracking-tight text-white" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}>
              PrepWithAhamed
            </span>
          </Link>
        </div>
        <div className="flex gap-4">
          <Link href="/" className="text-white hover:text-primary-200 font-medium">Home</Link>
          <Link href="/about" className="text-white hover:text-primary-200 font-medium">About Us</Link>
        </div>
      </nav>
      {children}
    </div>
  );
};

export default Layout;
