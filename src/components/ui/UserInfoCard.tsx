"use client";

import Card from "./Card";

interface UserInfoCardProps {
  name: string;
  email: string;
  role: string;
}

export function UserInfoCard({ name, email, role }: UserInfoCardProps) {
  return (
    <Card className="p-4 md:p-6 bg-white/90 backdrop-blur-sm border border-gray-100 flex flex-col gap-2">
      <p className="text-xs uppercase tracking-wide text-[#004B5B]/80 font-semibold">
        Signed in as
      </p>
      <div>
        <p className="text-lg font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{email}</p>
      </div>
      <span className="inline-flex w-fit px-3 py-1 text-xs font-medium rounded-full bg-[#004B5B]/10 text-[#004B5B] capitalize">
        {role.replace(/[-_]/g, " ").toLowerCase()}
      </span>
    </Card>
  );
}
