import LandingScreen from "@/components/LandingScreen";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <LandingScreen token={token} />;
}
