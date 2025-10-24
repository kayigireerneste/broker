"use client";

import dynamic from 'next/dynamic';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function DocsPage() {
  return (
    <div style={{ height: "100vh" }}>
      <SwaggerUI url="/swagger.json" />
    </div>
  );
}
