import { Bone, ProductGridSkeleton } from "@/components/shop/Skeletons";

export default function Loading() {
  return (
    <div
      aria-busy="true"
      className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="flex flex-col gap-3">
        <Bone className="h-3 w-24" />
        <Bone className="h-10 w-2/3 max-w-md" />
        <Bone className="h-4 w-1/2 max-w-sm" />
      </div>
      <ProductGridSkeleton count={4} className="lg:grid-cols-4" />
    </div>
  );
}
