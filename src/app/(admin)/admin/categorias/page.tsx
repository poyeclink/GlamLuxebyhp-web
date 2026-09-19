import { listCategoriesAdmin } from "@/server/services/category-service";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { ADMIN_PAGE_SIZE } from "@/lib/utils";

export default async function AdminCategoriesPage({
  searchParams,
}: PageProps<"/admin/categorias">) {
  const { q, page: pageParam } = await searchParams;
  const search = typeof q === "string" && q.trim() !== "" ? q.trim() : undefined;
  const page = Math.max(Number(typeof pageParam === "string" ? pageParam : "1") || 1, 1);

  const { items, total } = await listCategoriesAdmin({ search, page });

  return (
    <CategoriesManager
      categories={items}
      search={search}
      page={page}
      totalPages={Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))}
    />
  );
}
