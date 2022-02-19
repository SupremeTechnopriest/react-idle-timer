import dynamic from 'next/dynamic'

const ClientSideRenderedDemo = dynamic(
  () => import('@components/DemoRunner'),
  { ssr: false }
)

export default function MainDemo () {
  return <ClientSideRenderedDemo />
}
