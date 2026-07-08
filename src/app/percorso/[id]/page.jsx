import PercorsoDetailClient from "./PercorsoDetailClient"

export default async function PercorsoDetailPage({ params }) {
  const { id } = await params
  return <PercorsoDetailClient id={id} />
}
