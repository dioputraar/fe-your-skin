
"use client";

import RouteGuard from "@/components/auth/RouteGuard";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@heroui/react";
import * as Icon from "lucide-react";
import Datatable from "@/components/ui/Datatable";
import Sidebar from "@/components/layout/Sidebar";
import CategoryFormModal from "@/app/category/form";
import BadgePill from "@/components/ui/BadgePill";
import Can from "@/components/auth/Can";

const MENU = "Category";

export default function CategoryPage() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"insert" | "update">("insert");
  const [isRefresh, setIsRefresh] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ICategory>();

  const columns: ColumnDef<ICategory>[] = [
    {
      accessorKey: "",
      header: "No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "icon",
      header: "Icon",
      enableSorting: false,
      cell: ({ row }) => {
        const icon = row.original.icon;
        if (!icon) {
          return (
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400">
              <Icon.Layers size={18} />
            </div>
          );
        }
        const src = icon.startsWith("http")
          ? icon
          : `${process.env.NEXT_PUBLIC_CLOUDINARY_URL}/${icon}`;
        return (
          <img
            src={src}
            alt={row.original.name}
            className="h-10 w-10 object-contain rounded-xl border border-[#e6eff2] p-1 bg-white"
          />
        );
      },
    },
    {
      accessorKey: "name",
      header: "Nama Kategori",
      enableSorting: true,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => <BadgePill value={row.original.is_active} />,
    },
    {
      accessorKey: "",
      header: "Action",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="flex items-center justify-center gap-1.5">
            <Can do={["EDIT_CATEGORY", "MANAGE_CATEGORY"]}>
              <Button
                variant="secondary"
                size="sm"
                onPress={() => {
                  setSelectedItem(data);
                  setMode("update");
                  setOpen(true);
                }}
                className="gap-1.5 rounded-xl font-medium"
              >
                <Icon.Pencil size={15} />
                Edit
              </Button>
            </Can>
            <Can do={["DELETE_CATEGORY", "MANAGE_CATEGORY"]}>
              <Button
                variant="danger-soft"
                size="sm"
                className="gap-1.5 rounded-xl font-medium"
              >
                <Icon.Power size={15} />
                Deactive
              </Button>
            </Can>
          </div>
        );
      },
    },
  ];

  return (
        <RouteGuard requiredPermission={["VIEW_CATEGORY", "MANAGE_CATEGORY"]}>
            <div className="flex min-h-screen bg-[#EFF4F7]">
      <Sidebar />

      {/* --- Main content --- */}
      <main className="flex-1 px-10 py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2F8FB8]">
              Master Data
            </span>
            <h1 className="mt-1 text-5xl font-extrabold text-[#17324A]">{MENU}</h1>
            <p className="mt-2 text-gray-500">Kelola kategori produk untuk sistem katalog YourSkin.</p>
          </div>
          <Can do={["CREATE_CATEGORY", "MANAGE_CATEGORY"]}>
            <Button
              onPress={() => {
                setSelectedItem(undefined);
                setMode("insert");
                setOpen(true);
              }}
              className="shrink-0 gap-2 rounded-full bg-[#4A9CC7] px-6 py-3 font-bold text-white hover:bg-[#3f8fb8]"
            >
              <Icon.Plus size={18} />
              Tambah {MENU}
            </Button>
          </Can>
        </div>

        {/* --- DataTable --- */}
        <Datatable
          columns={columns}
          isRefresh={isRefresh}
          url={`${process.env.NEXT_PUBLIC_API_URL}/category/paging`}
        />

        {/* --- Form Modal --- */}
        <CategoryFormModal
          url={
            mode === "insert"
              ? `${process.env.NEXT_PUBLIC_API_URL}/category`
              : `${process.env.NEXT_PUBLIC_API_URL}/category/${selectedItem?.id}`
          }
          mode={mode}
          isOpen={open}
          data={mode === "update" ? selectedItem : null}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) setSelectedItem(undefined);
          }}
          onSuccess={() => setIsRefresh(!isRefresh)}
        />
      </main>
    </div>
        </RouteGuard>
  );
}

