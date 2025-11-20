'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@clerk/nextjs"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { ChangeEvent, useEffect, useState } from "react"
import { createDBRecord, getSignedURL } from "../utils/actions"

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function Page() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/')
      return;
    }
  }, []);

  const [name, setName] = useState('');
  const [file, setFiles] = useState<File | null>(null);
  const [imagePrev, setImagePrev] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {
    setLoading(true);

    if (!name) {
      return;
    }

    if (!file) {
      setLoading(false);
      return;
    }

    const signedUrlResult = await getSignedURL(file.type, file.size, name);
    if (signedUrlResult.failure) {
      setLoading(false);
      return alert("Unable to generate a signed url");
    }

    const signedUrl = signedUrlResult.success?.url;

    if (!signedUrl) {
      setLoading(false);
      return alert("Unable to generate a signed url");
    }

    await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    })

    console.log('file upload success');
    setLoading(false);
    router.push('/home')
  }

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file.size > MAX_FILE_SIZE) {
      return alert('File exceedes limit of 5M.B');
    }
    console.log(file.type);
    setFiles(file);
    let url = "";
    if (file.type != "application/pdf") {
      url = URL.createObjectURL(file);
    } else {
      url = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F010%2F750%2F673%2Foriginal%2Fpdf-icon-on-white-background-file-pdf-icon-sign-pdf-format-symbol-flat-style-free-vector.jpg&f=1&nofb=1&ipt=744e43ae179989c1598f0f07930fa39968542026defc6d0a643fd9c11d4c9f64";
    }
    setImagePrev(url);
  }

  return (
    <div className="w-sreen h-screen flex flex-col justify-start items-start px-16 font-primary bg-[#0f0f0f] text-white py-10">
      <h1 className="text-3xl font-semibold font-primary mt-10 mb-3">Upload your Document</h1>
      <h2>Add details of product to add</h2>
      <Label className="text-lg mt-10 mb-2">Document Name</Label>
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus={true}
        placeholder="Enter name of document"
        className="w-full bg-zinc-700 border-none"
      />
      <Label className="text-lg mt-10 mb-2">Product Name</Label>
      <label
        className="
        flex flex-col items-center justify-center 
        w-full h-[220px] cursor-pointer rounded-2xl 
        border-2 border-dashed border-zinc-300 
        bg-zinc-700 transition 
        hover:bg-zinc-500 hover:border-zinc-400
      "
      >
        <Upload className="w-10 h-10 text-white" />
        <span className="mt-2 text-sm text-white">
          Click to upload or drag & drop
        </span>

        <Input
          type="file"
          disabled={!!file}
          onChange={(e) => handleImageSelect(e)}
          className="hidden"
        />
      </label>

      {file &&
        <>
          <Label className="text-lg mt-5 mb-2">Preview</Label>
          <div className="flex gap-x-3 items-center">
            <div className="flex items-center justify-center overflow-hidden rounded-2xl w-[150px] h-[150px]">
              <img src={imagePrev} alt='' className="w-full h-full" />
            </div>
          </div>
        </>
      }

      <div className="flex w-full justify-between items-center gap-x-2 my-10">
        <Button
          disabled={loading}
          onClick={() => handleSubmit()}
          className="mt-10 w-[50%] bg-blue-600 hover:bg-blue-700 h-[50px]" variant={'default'}>
          {loading ? 'Loading ...' : "Upload"}
        </Button>
        <Button
          onClick={() => router.push('/home')}
          className="mt-10 w-[50%] h-[50px] bg-zinc-400 text-white" variant={'default'}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
