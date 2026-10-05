import { Bone, ProductGridSkeleton } from "@/components/shop/Skeletons";

export default function Loading() {
  return (
    <div aria-busy="true">
      <div className="bg-inverse">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-20">
          <Bone className="h-2.5 w-24 bg-inverse-border" />
          <div className="flex flex-col gap-3">
            <Bone className="h-12 w-56 bg-inverse-border sm:h-16 sm:w-80" />
            <Bone className="h-12 w-72 bg-inverse-border sm:h-16 sm:w-96" />
          </div>
          <Bone className="h-12 w-full max-w-xl rounded-full bg-inverse-border" />
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:py-14">
        <div className="flex gap-2">
          <Bone className="h-9 w-16 rounded-full" />
          <Bone className="h-9 w-24 rounded-full" />
          <Bone className="h-9 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <div className="hidden flex-col gap-4 lg:flex">
            <Bone className="h-3 w-24" />
            <Bone className="h-10" />
            <Bone className="h-3 w-16" />
            <Bone className="h-24" />
          </div>
          <ProductGridSkeleton count={6} className="sm:grid-cols-3" />
        </div>
      </div>
    </div>
  );
}
