import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 md:grid-cols-2 md:px-10">
      <Skeleton className="aspect-3/4" />
      <div>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-4 w-1/4" />
        <Skeleton className="mt-8 h-24 w-full" />
      </div>
    </div>
  );
}
