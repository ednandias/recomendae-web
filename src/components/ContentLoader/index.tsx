import type { ReactNode } from "react";
import { Loader } from "../Loader";

interface ContentLoaderProps {
  isLoading?: boolean;
  children: ReactNode;
}

export function ContentLoader({ isLoading, children }: ContentLoaderProps) {
  return (
    <>
      {isLoading ? (
        <div className="min-w-full flex flex-col items-center justify-center gap-2.5">
          <Loader />
        </div>
      ) : (
        children
      )}
    </>
  );
}
