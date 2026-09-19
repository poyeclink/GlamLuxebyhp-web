"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";
import { createCategoryAction, updateCategoryAction } from "@/server/actions/category-actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
};

type ModalState = { mode: "create" } | { mode: "edit"; category: Category } | null;

export function CategoriesManager({
  categories,
  search,
  page,
  totalPages,
}: {
  categories: Category[];
  search?: string;
  page: number;
  totalPages: number;
}) {
  const [modal, setModal] = useState<ModalState>(null);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Categorías</h1>
        <Button onClick={() => setModal({ mode: "create" })}>Nueva categoría</Button>
      </div>

      <SearchInput action="/admin/categorias" placeholder="Buscar por nombre..." defaultValue={search} />

      {categories.length === 0 ? (
        <p className="text-muted-foreground">
          {search ? `No encontramos categorías para "${search}".` : "Todavía no hay categorías."}
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 font-medium">Nombre</th>
              <th className="py-2 font-medium">Slug</th>
              <th className="py-2 font-medium">Productos</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-border">
                <td className="py-3 text-foreground">{category.name}</td>
                <td className="py-3 text-muted-foreground">{category.slug}</td>
                <td className="py-3 text-muted-foreground">{category._count.products}</td>
                <td className="py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setModal({ mode: "edit", category })}
                    >
                      Editar
                    </Button>
                    <DeleteCategoryButton categoryId={category.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(target) =>
          `/admin/categorias?${search ? `q=${encodeURIComponent(search)}&` : ""}page=${target}`
        }
      />

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Editar categoría" : "Nueva categoría"}
      >
        {modal !== null && (
          <CategoryForm
            action={
              modal.mode === "edit" ? updateCategoryAction.bind(null, modal.category.id) : createCategoryAction
            }
            defaultValues={
              modal.mode === "edit"
                ? { name: modal.category.name, slug: modal.category.slug }
                : undefined
            }
            submitLabel={modal.mode === "edit" ? "Guardar cambios" : "Crear categoría"}
            onSuccess={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
