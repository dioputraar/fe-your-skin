import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// import { useRouter } from "next/router";
import Modal from "@/components/common/Modal";
import Swal from "sweetalert2";
import { showToast } from "@/utils/Toast";

const schema = yup.object().shape({
  BehaviorName: yup.string().required("Name is required"),
  BehaviorDescription: yup.string().required("Description is required"),
});

export default function ModalUpsert({
  isModalOpen,
  setIsModalOpen,
  isRefresh,
  setIsRefresh,
  action = "Input",
  data = null,
  setData = null,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      BehaviorName: "",
      BehaviorDescription: "",
    },
  });

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        if (!data) return;
        setValue("BehaviorName", data.BehaviorName || "");
        setValue("BehaviorDescription", data.BehaviorDescription || "");
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        });
      }
    };
    getData();
  }, [data, setValue]);

  useEffect(() => {
    if (!isModalOpen) {
      reset();
    }
  }, [isModalOpen, reset]);

  const onSubmit = async (behavior) => {
    setIsLoading(true);
    try {
      // Adjust the submission logic to match the form's purpose
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-management/behavior`,
        {
          BehaviorID: data.BehaviorID,
          BehaviorName: behavior.BehaviorName,
          BehaviorDescription: behavior.BehaviorDescription,
        }
      );

      if (response.status === 201) {
        setIsModalOpen(false);
        reset();
        setIsRefresh(!isRefresh);
        Swal.fire({
          title: "Success!",
          text: "Vendor has been updated successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      if (err.response.status === 409) {
        showToast("warning", "Warning", err.response.data.message);
      } else {
        showToast("error", "Error", err.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isModalOpen={isModalOpen} longContent={false}>
      <div className="modal-header">
        <h3 className="modal-title">{`${action} Behavior`}</h3>
        <button
          className="btn btn-xs btn-icon btn-light"
          onClick={() => {
            setIsModalOpen(false);
            setData(null);
          }}
        >
          <i className="ki-outline ki-cross"></i>
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="">
        <div className="modal-body card-body flex flex-col gap-5 p-10">
          <div className="flex flex-1 flex-col gap-1">
            <label className="form-label font-normal text-gray-900 flex items-center gap-1">
              Name
              <span className="text-danger">*</span>
            </label>
            <Controller
              name="BehaviorName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className={`input ${
                    errors.BehaviorName ? "border-red-500" : ""
                  }`}
                  type="text"
                  placeholder="Behavior Name..."
                />
              )}
            />
            {errors.BehaviorName && (
              <p className="text-red-500 text-sm">
                {errors.BehaviorName?.message as string}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label font-normal text-gray-900 flex items-center gap-1">
              Description
              <span className="text-danger">*</span>
            </label>
            <Controller
              name="BehaviorDescription"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  className={`textarea ${
                    errors.BehaviorDescription ? "border-red-500" : ""
                  }`}
                  placeholder="Behavior Description..."
                />
              )}
            />
            {errors.BehaviorDescription && (
              <p className="text-red-500 text-sm">
                {errors.BehaviorDescription?.message as string}
              </p>
            )}
          </div>
        </div>
        <div className="modal-footer justify-end">
          <div className="flex gap-4">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setIsModalOpen(false);
                setData(null);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
