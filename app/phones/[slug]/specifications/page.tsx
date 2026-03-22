import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SpecificationsPage({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(`/phones/${slug}`);
}
