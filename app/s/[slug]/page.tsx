import Editor from '@/components/Editor';
export default function SharedStrat({ params }: { params: { slug: string } }) {
  return <Editor slug={params.slug} />;
}
