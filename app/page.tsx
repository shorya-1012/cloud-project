import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {

  const { userId } = await auth();

  if (userId) {
    redirect('/home')
  }

  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800" />


      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl font-bold text-white mb-4">
          Welcome
        </h1>
        <p className="text-lg text-gray-300 mb-10">
          Sign in to start uploading documents
        </p>

        <div
          className="flex items-center gap-3 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold shadow-xl hover:bg-gray-200 transition"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 488 512"
            fill="currentColor"
          >
            <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C322.4 104.8 288.9 92 248 92 150.2 92 73.7 168.5 73.7 266S150.2 440 248 440c113.7 0 147.3-81.5 153.5-123.7H248v-98.5h240z" />
          </svg>
          <SignInButton />
        </div>
      </div>
    </main>
  );
}

