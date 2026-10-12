"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { AdminCardList, AdminListCard } from "@/components/admin/AdminListCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";
import { createCategoryAction, updateCategoryAction } from "@/server/actions/category-actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent: { name: string } | null;
  _count: { products: number; children: number };
};

type ParentOption = { id: string; name: string; slug: string };

type ModalState = { mode: "create" } | { mode: "edit"; category: Category } | null;

export function CategoriesManager({
  categories,
  parents,
  search,
  page,
  totalPages,
}: {
  categories: Category[];
  parents: ParentOption[];
  search?: string;
  page: number;
  totalPages: number;
}) {
  const t = useAdminT();
  const [modal, setModal] = useState<ModalState>(null);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        eyebrow={t("Catálogo")}
        title={t("Categorías")}
        description={t(
          "Las categorías con productos activos aparecen solas en el menú de la tienda. Las subcategorías (ej. Zapatos › Mujer) se muestran dentro de su categoría principal.",
        )}
        action={
          <Button onClick={() => setModal({ mode: "create" })}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("Nueva categoría")}
          </Button>
        }
      />

      <SearchInput
        action="/admin/categorias"
        placeholder={t("Buscar por nombre...")}
        defaultValue={search}
      />

      {categories.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
          {search
            ? t('No encontramos categorías para "{search}".', { search })
            : t("Todavía no hay categorías.")}
        </p>
      ) : (
        <>
          <AdminCardList>
            {categories.map((category) => (
              <AdminListCard
                key={category.id}
                title={
                  category.parent ? (
                    <>
                      <span className="text-muted-foreground">{category.parent.name} › </span>
                      {category.name}
                    </>
                  ) : (
                    category.name
                  )
                }
                meta={[
                  category.parent
                    ? t("Subcategoría")
                    : category._count.children > 0
                      ? t("Principal · {count} sub", { count: category._count.children })
                      : t("Principal"),
                  category._count.products === 1
                    ? t("1 producto")
                    : t("{count} productos", { count: category._count.products }),
                ].join(" · ")}
                actions={
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setModal({ mode: "edit", category })}
                    >
                      {t("Editar")}
                    </Button>
                    <DeleteCategoryButton categoryId={category.id} />
                  </>
                }
              />
            ))}
          </AdminCardList>
          <DataTable className="hidden md:block">
            <thead>
              <tr>
                <th>{t("Nombre")}</th>
                <th>{t("Categoría principal")}</th>
                <th>{t("Slug")}</th>
                <th>{t("Productos")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="font-medium text-foreground">{category.name}</td>
                  <td className="text-muted-foreground">
                    {category.parent?.name ??
                      (category._count.children > 0
                        ? t("Principal · {count} sub", { count: category._count.children })
                        : t("Principal"))}
                  </td>
                  <td className="font-mono text-xs text-muted-foreground">{category.slug}</td>
                  <td className="text-muted-foreground">{category._count.products}</td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setModal({ mode: "edit", category })}
                      >
                        {t("Editar")}
                      </Button>
                      <DeleteCategoryButton categoryId={category.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </>
      )}

      <Pagination
        t={t}
        page={page}
        totalPages={totalPages}
        buildHref={(target) =>
          `/admin/categorias?${search ? `q=${encodeURIComponent(search)}&` : ""}page=${target}`
        }
      />

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? t("Editar categoría") : t("Nueva categoría")}
        closeLabel={t("Cerrar")}
      >
        {modal !== null && (
          <CategoryForm
            action={
              modal.mode === "edit"
                ? updateCategoryAction.bind(null, modal.category.id)
                : createCategoryAction
            }
            defaultValues={
              modal.mode === "edit"
                ? {
                    name: modal.category.name,
                    slug: modal.category.slug,
                    parentId: modal.category.parentId,
                  }
                : undefined
            }
            // Una categoría con subcategorías no puede volverse subcategoría
            // (un solo nivel), así que ni se le ofrece el selector.
            parents={
              modal.mode === "edit"
                ? modal.category._count.children > 0
                  ? null
                  : parents.filter((parent) => parent.id !== modal.category.id)
                : parents
            }
            submitLabel={modal.mode === "edit" ? t("Guardar cambios") : t("Crear categoría")}
            onSuccess={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
