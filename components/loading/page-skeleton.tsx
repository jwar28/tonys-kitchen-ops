"use client";

import "@/bones/registry";
import { Skeleton } from "boneyard-js/react";
import type { ReactNode } from "react";

type PageSkeletonProps = {
  name: string;
  loading?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
};

export function PageSkeleton({ name, loading = false, children, fallback }: PageSkeletonProps) {
  return (
    <Skeleton
      name={name}
      loading={loading}
      fallback={fallback}
      animate="shimmer"
      transition
      stagger
      color="rgba(190, 164, 146, 0.34)"
      darkColor="rgba(255, 245, 238, 0.14)"
      className="[&_*]:!rounded-[1rem]"
    >
      {children}
    </Skeleton>
  );
}
