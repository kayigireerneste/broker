"use client";

import dynamic from 'next/dynamic';
import { useCallback } from 'react';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function DocsPage() {
  const onComplete = useCallback(() => {
    const consoleError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes('UNSAFE_')) return;
      consoleError(...args);
    };

    return () => {
      console.error = consoleError;
    };
  }, []);

  return (
    <div className="swagger-container" style={{ height: "100vh", maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <SwaggerUI
        url="/swagger.json"
        onComplete={onComplete}
        docExpansion="list"
        deepLinking={true}
        filter={true}
        persistAuthorization={true}
      />
    </div>
  );
}