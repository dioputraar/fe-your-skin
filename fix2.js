const fs = require('fs');

let content = fs.readFileSync('components/ui/datatable.tsx', 'utf-8');

// 1. Fix Select component TS error by replacing the HeroUI <Select> with native <select>
content = content.replace(/<Select\s+items=\{columnOptions\}([\s\S]*?)<\/Select>/, (match, p1) => {
    return `<select
                              value={filter.column || ""}
                              onChange={(e) => updateFilter(index, "column", e.target.value)}
                              className="flex-1 min-w-[120px] p-2 text-sm border border-[#e6eff2] rounded-md bg-transparent"
                            >
                              <option value="">Select Column</option>
                              {columnOptions.map((col: any) => (
                                <option key={col.key} value={col.key}>{col.label}</option>
                              ))}
                            </select>`;
});

// Remove Select and SelectItem from imports from @heroui/react
content = content.replace(/Select,\s*SelectItem,\s*/, '');

// 2. Remove closeOnSelect from DropdownMenu
content = content.replace(/closeOnSelect=\{false\}/g, '');

// 3. Fix DropdownItem startContent by just putting the icon inside the children
// Match: <DropdownItem key={format} onPress={() => exportData(format)} startContent={<Icon.Download size={16} />}>
content = content.replace(/startContent=\{<Icon\.Download size=\{16\} \/>\}/g, '');
content = content.replace(/Export \{format\.toUpperCase\(\)\}/g, '<Icon.Download size={16} /> <span className="ml-2">Export {format.toUpperCase()}</span>');

// 4. Remove placement="bottom-end" from Popover
content = content.replace(/placement="bottom-end"/g, '');

// 5. Fix DynamicSelect any array error (though this might already be fixed by DynamicSelect.tsx changes, let's just make it safe)
// No changes needed because it's just the `label={[selectedColumn.accessorKey]}` which is now valid.

fs.writeFileSync('temp_datatable2.tsx', content, 'utf-8');

