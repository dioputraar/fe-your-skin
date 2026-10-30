import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import Select from "react-select";

interface DynamicSelectProps {
  name?: string;
  control?: Control<any>;
  errors?: FieldErrors<any>;
  url: string;
  className?: string;
  usePagination?: boolean;
  placeholder?: string;
  isMulti?: boolean;
  disabled?: boolean;
  value?: string | null;
  label?: string[];
  separator?: string;
  isModal?: boolean;
  onChange?: (val: any) => void;
  id?: string;
}

const DynamicSelect: React.FC<DynamicSelectProps> = ({
  name = "dynamic_select",
  control,
  errors = {},
  url,
  className = "text-sm absolute w-full z-100",
  usePagination = false,
  placeholder = "Select an option...",
  isMulti = false,
  disabled = false,
  value = null,
  label = [],
  separator = " | ",
  isModal = false,
  onChange,
  id,
}) => {
  const [page, setPage] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [options, setOptions] = useState<{ value: any; label: string }[]>([]);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isModal) {
      const el = document.getElementById("Modal");
      setParentElement(el || document.body);
    } else {
      setParentElement(document.body);
    }
  }, [isModal]);

  const fetchData = useCallback(async (searchValue: string, currentPage: number) => {
    try {
      let api = `${url}?search=${searchValue}`;

      if (usePagination) {
        api += `&page=${currentPage}&limit=10`;
      } else {
        api += `&page=1&limit=1000`;
      }

      const response = await axios.get(api);
      const data = response.data.data;

      if (!value) {
        return { options: [], totalItems: 0, currentPage: 1, totalPages: 1 };
      }

      const uniqueOptions = Array.from(
        new Set(data.data.map((meta: any) => meta[value]))
      ).map((uniqueValue) => {
        const meta = data.data.find((meta: any) => meta[value] === uniqueValue);
        return {
          value: meta[value],
          label: label.map((l: string) => meta[l]).join(` ${separator} `),
        };
      });

      return {
        options: uniqueOptions,
        totalItems: data.totalItems,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      return { options: [], totalItems: 0, currentPage: 1, totalPages: 1 };
    }
  }, [url, usePagination, value, label, separator]);

  const loadOptions = useCallback(async () => {
    const { options: newOptions, currentPage, totalPages } = await fetchData(
      inputValue,
      page
    );

    setOptions((prev) => (page === 1 ? newOptions : [...prev, ...newOptions]));
    setHasMore(currentPage < totalPages);
  }, [fetchData, inputValue, page]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const selectProps = {
    options,
    id,
    onMenuScrollToBottom: () => {
      if (usePagination && hasMore) {
        setPage((prev) => prev + 1);
      }
    },
    className,
    styles: {
      control: (base: any, state: any) => ({
        ...base,
        borderColor: errors[name]
          ? state.isFocused
            ? "#DBDFE9"
            : "red"
          : "#DBDFE9",
        "&:hover": {
          borderColor: state.isFocused ? "#DBDFE9" : base.borderColor,
        },
      }),
    },
    isDisabled: disabled,
    onInputChange: (newValue: string) => {
      setInputValue(newValue);
      setPage(1);
    },
    placeholder,
    isMulti,
    menuPortalTarget: parentElement,
  };

  if (!control) {
    return (
      <div>
        <Select 
          {...selectProps} 
          onChange={(val: any) => {
            if (onChange) onChange(val);
          }}
        />
        {errors[name] && (
          <p className="text-red-500 text-sm">{errors[name]?.message as string}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            {...selectProps}
            {...field}
            onChange={(val: any) => {
              field.onChange(val);
              if (onChange) onChange(val);
            }}
          />
        )}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm">{errors[name]?.message as string}</p>
      )}
    </div>
  );
};

export default DynamicSelect;
