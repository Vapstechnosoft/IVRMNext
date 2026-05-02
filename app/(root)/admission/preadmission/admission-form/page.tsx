import AdmissionFormPageClient from './_components/page-client';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function StudentApplicationPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = await props.searchParams;

    return <AdmissionFormPageClient searchParams={searchParams} />;
}
