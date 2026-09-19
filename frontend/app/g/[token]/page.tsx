import GalleryClient from "@/components/GalleryClient";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <GalleryClient token={token} />;
}
