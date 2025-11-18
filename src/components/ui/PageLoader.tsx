import Image from "next/image";

type PageLoaderProps = {
  title?: string;
  description?: string;
};

export default function PageLoader({
  title = "Preparing your experience…",
  description = "Please hold on while we load the next page.",
}: PageLoaderProps) {
  return (
    <div className="min-h-screen w-full bg-[#f4fbfc] flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="relative h-20 w-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#2d94b0]/30 border-t-[#004F64] animate-spin" />
          <Image
            src="/logo.svg"
            alt="Broker logo"
            width={48}
            height={20}
            className="relative z-10 h-10 w-auto"
            priority
          />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-[#004F64]">{title}</p>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
