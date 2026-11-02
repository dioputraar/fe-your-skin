"use client";

import Datatable from "@/components/ui/Datatable";
import Sidebar from "@/components/layout/Sidebar";
import FormModal from "@/app/ingredient/form";
import BadgePill from "@/components/ui/BadgePill";
import Can from "@/components/auth/Can";
import { Button } from "@heroui/react";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import * as Icon from "lucide-react";

const MENU = "Ingredient";

export default function IngredientPage() {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"insert" | "update">("insert");
    const [selectedItem, setSelectedItem] = useState<IIngredient>();
    const [isRefresh, setIsRefresh] = useState(false);

    const columns: ColumnDef<IIngredient>[] = [
        {
            accessorKey: "",
            header: "No",
            cell: ({ row }) => {
                return <div>{row.index + 1}</div>;
            },
        },
        {
            accessorKey: "name",
            header: "Ingredient",
            enableSorting: true,
        },
        {
            accessorKey: "primary_function",
            header: "Function",
            enableSorting: true,
        },
        {
            accessorKey: "comedogenic_rating",
            header: "Comedogenic",
            enableSorting: true,
        },
        {
            accessorKey: "is_safe_for_pregnancy",
            header: "For Pregnancy",
            enableSorting: true,
            cell: ({ row }) => {
                return (
                    <BadgePill
                        value={row.original.is_safe_for_pregnancy}
                        trueLabel="Safe"
                        falseLabel="Not Safe"
                        trueColor="success"
                        falseColor="danger"
                    />
                );
            },
        },
        {
            accessorKey: "is_safe_for_fungal_acne",
            header: "For Acne",
            enableSorting: true,
            cell: ({ row }) => {
                return (
                    <BadgePill
                        value={row.original.is_safe_for_fungal_acne}
                        trueLabel="Safe"
                        falseLabel="Not Safe"
                        trueColor="success"
                        falseColor="danger"
                    />
                );
            },
        },
        {
            accessorKey: "is_active",
            header: "Status",
            enableSorting: true,
            cell: ({ row }) => {
                return <BadgePill value={row.original.is_active} />;
            },
        },
        {
            accessorKey: "",
            header: "Action",
            cell: ({ row }) => {
                const data = row.original;
                return (
                    <div className="flex items-center justify-center gap-1.5">
                        <Can do={["EDIT_INGREDIENT", "MANAGE_INGREDIENT"]}>
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
                        <Can do={["DELETE_INGREDIENT", "MANAGE_INGREDIENT"]}>
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
                    </div>
                    <Can do={["CREATE_INGREDIENT", "MANAGE_INGREDIENT"]}>
                        <Button
                            onPress={() => {
                                setSelectedItem(undefined);
                                setMode("insert");
                                setOpen(true);
                            }}
                            className="shrink-0 gap-2 rounded-full bg-[#4A9CC7] px-6 py-3 font-bold text-white hover:bg-[#3f8fb8]"
                        >
                            <Icon.Plus size={18} />
                            Add {MENU}
                        </Button>
                    </Can>
                </div>

                {/* --- DataTable --- */}
                <Datatable
                    columns={columns}
                    isRefresh={isRefresh}
                    url={`${process.env.NEXT_PUBLIC_API_URL}/ingredient/paging`}
                />

                {/* --- Form Upsert Modal --- */}
                <FormModal
                    url={
                        mode === "insert"
                            ? `${process.env.NEXT_PUBLIC_API_URL}/ingredient`
                            : `${process.env.NEXT_PUBLIC_API_URL}/ingredient/${selectedItem?.id}`
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
    );
}
