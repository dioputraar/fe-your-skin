"use client"

import Datatable from "@/components/ui/Datatable"
import Sidebar from "@/components/layout/Sidebar"
import BrandFormModal from "@/app/brand/form"
import BadgePill from "@/components/ui/BadgePill"
import { Button, Chip } from "@heroui/react"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import * as Icon from "lucide-react"

const MENU = "Brand";

export default function BrandPage() {
    const [tableData, setTableData] = useState([]);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"insert" | "update">("insert");
    const [isRefresh, setIsRefresh] = useState(false);
    const [selectedItem, setSelectedItem] = useState<IBrand>();
    const columns: ColumnDef<IBrand>[] = [
        {
            accessorKey: "",
            header: "No",
            cell: ({ row }) => {
                return <div>{row.index + 1}</div>;
            },
        },
        {
            accessorKey: "image",
            header: "Logo",
            enableSorting: false,
            cell: ({ row }) => {
                return (
                    <img className="h-32 w-32" src={`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}/${row.original.image}`} alt="Gambar" />
                );
            }
        },
        {
            accessorKey: "name",
            header: "Brand",
            enableSorting: true,
        },
        {
            accessorKey: "is_halal_certified",
            header: "Is Halal",
            enableSorting: true,
            cell: ({ row }) => {
                return (
                    <BadgePill
                        value={row.original.is_halal_certified}
                        trueLabel="Halal"
                        falseLabel="Non-Halal"
                        trueColor="success"
                        falseColor="default"
                    />






                );
            }
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => {
                return (
                    <BadgePill value={row.original.is_active} />


                );
            },
        },
        {
            accessorKey: "parent_company",
            header: "Company",
            enableSorting: true,
        },
        {
            accessorKey: "",
            header: "Action",
            cell: ({ row }) => {
                const data = row.original;
                console.log(data);
                return (
                    <div className="flex items-center justify-center gap-1.5">
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
                        <Button
                            variant="danger-soft"
                            size="sm"
                            className="gap-1.5 rounded-xl font-medium"
                        >
                            <Icon.Power size={15} />
                            Deactive
                        </Button>
                    </div >
                );
            },
        },
    ];

    const handleDataChange = (data: any) => {
        setTableData(data);
    };
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
                    <Button onPress={() => { setSelectedItem(undefined); setMode("insert"); setOpen(true); }} className="shrink-0 gap-2 rounded-full bg-[#4A9CC7] px-6 py-3 font-bold text-white hover:bg-[#3f8fb8]">
                        <Icon.Plus size={18} />
                        Add {MENU}
                    </Button>
                </div>

                {/* --- DataTable --- */}
                <Datatable columns={columns} isRefresh={isRefresh} url={`${process.env.NEXT_PUBLIC_API_URL}/brand/paging`} />

                {/* --- Form Input --- */}
                <BrandFormModal
                    url={mode === "insert" ? `${process.env.NEXT_PUBLIC_API_URL}/brand/` : `${process.env.NEXT_PUBLIC_API_URL}/brand/${selectedItem?.id}`}
                    mode={mode}
                    isOpen={open}
                    data={mode === "update" ? selectedItem : null}
                    onOpenChange={(isOpen) => {
                        setOpen(isOpen);
                        if (!isOpen) setSelectedItem(undefined);
                    }}
                    onSuccess={() => setIsRefresh(!isRefresh)} />
            </main>
        </div>
    )
}

