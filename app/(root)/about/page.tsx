import React from "react";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-center">About Us</h1>
      <p className="text-base sm:text-lg text-center mb-2 px-4 max-w-2xl">
        PrepWithAhamed is an AI-powered platform to help you prepare for job interviews with realistic voice agents.
      </p>
      <p className="text-base sm:text-lg text-center px-4 max-w-2xl">
        Our mission is to make interview practice accessible, effective, and engaging for everyone.
      </p>
    </div>
  );
} 