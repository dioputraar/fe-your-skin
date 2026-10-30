import React, { useState } from "react";
import Main from "../../../main-layouts/main";
import DataTable from "../../../components/common/Datatables";
import clsx from "clsx";
import { ColumnDef } from "@tanstack/react-table";
import ModalUpsert from "@/components/modal/behavior/Modal";
import Swal from "sweetalert2";
import axios from "axios";

function Behavior() {
  const menu = "Behavior";
  const [isModalInputOpen, setIsModalInputOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [isRefresh, setIsRefresh] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IBehavior>(null);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [tableData, setTableData] = useState([]);
  const title = "Behavior";

  const columns: ColumnDef<IBehavior>[] = [
    {
      accessorKey: "",
      header: "No",
      cell: ({ row }) => {
        return <div>{row.index + 1}</div>;
      },
    },
    {
      accessorKey: "BehaviorName",
      header: "Name",
      enableSorting: true,
    },
    {
      accessorKey: "BehaviorDescription",
      header: "Description",
      enableSorting: true,
    },
    {
      accessorKey: "",
      header: "Action",
      cell: ({ row }) => {
        const data = row.original;
        // console.log(data);
        return (
          <div className="flex space-x-1 justify-center">
            <button
              className={clsx(
                "btn btn-icon bg-red-500 btn-xs transition-transform",
                "hover:scale-[105%]",
                "active:scale-[100%]"
              )}
              title="Delete"
              onClick={async () => {
                console.log("Delete", data);
                Swal.fire({
                  title: "Are you sure?",
                  text: "You won't be able to revert this!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Yes, delete it!",
                  cancelButtonText: "No, cancel!",
                  reverseButtons: true,
                  customClass: {
                    confirmButton: "btn btn-outline btn-danger",
                    cancelButton: "btn btn-outline btn-dark",
                  },
                }).then(async (result) => {
                  if (result.isConfirmed) {
                    const response = await axios.delete(
                      `${process.env.NEXT_PUBLIC_API_URL}/api/user-management/behavior/${data.BehaviorID}`
                    );
                    console.log(response);
                    setIsRefresh(!isRefresh);

                    Swal.fire(
                      "Deleted!",
                      "Your file has been deleted.",
                      "success"
                    );
                  }
                });
              }}
            >
              <i className="ki-outline ki-trash text-white"></i>
            </button>
          </div>
        );
      },
    },
  ];

  const handleDataChange = (data: any) => {
    setTableData(data);
  };

  return (
    <Main title={title}>
      <div className="container-fixed">
        <div className="flex flex-wrap items-center lg:items-end justify-between gap-5 pb-7.5">
          {/* <div className="flex flex-col justify-center gap-2">
            <h1 className="text-xl font-medium leading-none text-gray-900">
              {menu}
            </h1>
          </div> */}
          <div className="flex items-center gap-2.5">
            <button
              className="btn btn-primary"
              onClick={() => setIsModalInputOpen(true)}
            >
              <i className="ki-outline ki-plus-squared"></i>
              Add New {menu}
            </button>
          </div>
        </div>
      </div>
      <div className="container-fixed">
        <div className="grid gap-5 lg:gap-7.5">
          <DataTable
            columns={columns}
            url={`${process.env.NEXT_PUBLIC_API_URL}/api/user-management/behavior`}
            isRefresh={isRefresh}
            setIsRefresh={setIsRefresh}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            onDataChange={handleDataChange}
            // exportFormats={["xlsx"]}
          />
        </div>
      </div>

      {/* Modal Input */}
      <ModalUpsert
        isModalOpen={isModalInputOpen}
        setIsModalOpen={setIsModalInputOpen}
        isRefresh={isRefresh}
        setIsRefresh={setIsRefresh}
        setData={setSelectedItem}
        action="Input"
      />

      {/* Modal Update Insert */}
      <ModalUpsert
        isModalOpen={isModalEditOpen}
        setIsModalOpen={setIsModalEditOpen}
        isRefresh={isRefresh}
        setIsRefresh={setIsRefresh}
        data={selectedItem}
        setData={setSelectedItem}
        action="Edit"
      />
    </Main>
  );
}

export default Behavior;