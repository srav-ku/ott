export default async function LanguagePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <div>Language {code}</div>;
}
