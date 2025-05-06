'use client';

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { CodeProvider } from "@/lib/context/CodeContext";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <CodeProvider>
        {children}
      </CodeProvider>
    </ConvexProvider>
  );
} 