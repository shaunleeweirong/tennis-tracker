import { CoachPage } from "@/components/tracker-app";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CoachPage detailId={id} />;
}
