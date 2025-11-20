"use client";

import { DownloadCloud, LogOutIcon, UploadCloud } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { getDownloadUrl } from "@/app/utils/actions";

export interface FileItem {
  id: string;
  name: string;
  file_type: string;
  file_key: string;
  created_at: string;
}

export default function HomePageMain({
  files
}: {
  files: FileItem[];
}) {
  const { user, signOut } = useClerk();

  const handleDownload = async (file_key: string, file_name: string) => {
    // console.log(file_key);
    const downloadurlRes = await getDownloadUrl(file_key);
    if (downloadurlRes.failure) {
      return alert(downloadurlRes.failure);
    }
    const downloadUrl = downloadurlRes.success?.url;
    if (!downloadUrl) {
      return alert("unable to download");
    }

    // actually download the thing
    await fetch(downloadUrl, { method: 'GET' });
    const res = await fetch(downloadUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${file_name}.${downloadurlRes.success?.type}`;
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen w-full bg-[#0f0f0f] text-white p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-10 mt-5">
        <div className="flex flex-col items-start justify-center">
          <h1 className="text-2xl font-semibold">
            Welcome, {user?.fullName}
          </h1>
          <button
            onClick={() => signOut()}
            className="flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-700 mt-2"
          >
            <LogOutIcon size={15} />
            Logout
          </button>
        </div>

        <Link href={'/upload'} className="flex items-center gap-x-2 px-5 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-medium">
          <UploadCloud size={18} />
          Upload Document
        </Link>
      </div>

      {/* File List */}
      <div className="space-y-4 mt-5 ">
        {files.map((f) => (
          <div
            key={f.id}
            className="w-full flex items-center justify-between bg-[#1a1a1a] border border-[#2b2b2b] px-5 py-4 rounded-xl"
          >
            <div>
              <div className="text-lg font-medium mb-2">{f.name}</div>
              <div className="text-sm text-gray-400">
                Created at: {f.created_at}
              </div>
            </div>

            <button className="flex justify-center items-center gap-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium"
              onClick={() => { handleDownload(f.file_key, f.name) }}
            >
              <DownloadCloud />
              Download
            </button>
          </div>
        ))}

        {files.length === 0 && (
          <div className="text-gray-500 text-center mt-20 flex items-center justify-center h-[60vh] text-2xl">
            Nothing to see here :(
          </div>
        )}
      </div>
    </div>
  );
}

