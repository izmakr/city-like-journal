"use client";

import dynamic from "next/dynamic";

const ClientHeader = dynamic(() => import("./Header").then((mod) => mod.Header), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

export const HeaderClient = () => <ClientHeader />;


