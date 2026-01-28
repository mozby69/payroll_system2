import ProfileClient from "./ProfileClient";

type PageProps = {
  params: Promise<{
    empCode: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { empCode } = await params;

  return (
    <div className="relative w-full min-h-screen flex flex-col gap-y-4 py-8 items-center text-mainGray">
        <ProfileClient empCode={empCode}/>
    </div>
  );
}
