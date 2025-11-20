import Dashboard, { FileItem } from "@/components/ui/homePage";
import { createClient } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server"
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function UserHome() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  const supabse = await createClient();
  const { data, error } = await supabse.from('files').select('*').eq('user_id', userId).order('created_at', { 'ascending': false });
  if (error) {
    console.log(error);
  }

  if (!data) {
    return;
  }

  const files = data.map(f => ({
    ...f,
    created_at: new Date(f.created_at).toISOString().split('T')[0]
  }));


  return (
    <Dashboard files={files} />
  )
}
