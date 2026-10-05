import { Bone } from "@/components/shop/Skeletons";

export default function Loading() {
  return (
    <div aria-busy="true" className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:py-14">
      <Bone className="h-3 w-40" />
      <div className="grid gap-10 md:grid-cols-2">
        <Bone className="aspect-[4/5] rounded-2xl" />
        <div className="flex flex-col gap-5">
          <Bone className="h-3 w-24" />
          <Bone className="h-10 w-3/4" />
          <Bone className="h-6 w-1/3" />
          <div className="flex gap-2 pt-4">
            <Bone className="h-11 w-14" />
            <Bone className="h-11 w-14" />
            <Bone className="h-11 w-14" />
          </div>
          <Bone className="mt-4 h-14 rounded-full" />
          <Bone className="h-20" />
        </div>
      </div>
    </div>
  );
}
