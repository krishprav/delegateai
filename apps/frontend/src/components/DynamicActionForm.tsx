import { actionSchemas } from "@/lib/constant";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

interface DynamicActionFormProps {
    actionType: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialValues: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubmit: (values: any) => void;
    onCancel: () => void;
}

export const DynamicActionForm = ({
    actionType,
    initialValues,
    onSubmit,
    onCancel,
}: DynamicActionFormProps) => {
    const schema = actionSchemas[actionType];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formData, setFormData] = useState<any>(initialValues || {});

    useEffect(() => {
        setFormData(initialValues || {});
    }, [initialValues]);

    if (!schema) {
        return <div className="text-gray-400 italic">No configuration available for this action type.</div>;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {schema.fields.map((field: any) => (
                <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="text-sm font-medium text-gray-300">
                        {field.label}
                        {field.required && <span className="text-teal-500 ml-1">*</span>}
                    </Label>

                    {field.type === "text" && (
                        <Input
                            id={field.name}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-teal-500/50 focus:ring-teal-500/20"
                        />
                    )}

                    {field.type === "textarea" && (
                        <Textarea
                            id={field.name}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-teal-500/50 focus:ring-teal-500/20 min-h-[100px]"
                        />
                    )}

                    {field.type === "select" && (
                        <Select
                            value={formData[field.name] || ""}
                            onValueChange={(value) => handleChange(field.name, value)}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-teal-500/20">
                                <SelectValue placeholder={field.placeholder || "Select option"} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0A] border-white/10 text-white">
                                {field.options.map((option: string) => (
                                    <SelectItem key={option} value={option} className="focus:bg-white/10 focus:text-white">
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {field.type === "toggle" && (
                        <div className="flex items-center space-x-2">
                            <Switch
                                id={field.name}
                                checked={formData[field.name] || false}
                                onCheckedChange={(checked) => handleChange(field.name, checked)}
                                className="data-[state=checked]:bg-teal-500 border-white/20"
                            />
                            <span className="text-sm text-gray-400">{field.description}</span>
                        </div>
                    )}

                    {field.description && field.type !== "toggle" && (
                        <p className="text-xs text-gray-500">{field.description}</p>
                    )}
                </div>
            ))}

            <div className="flex justify-end gap-2 pt-4 group">
                <Button type="button" variant="ghost" onClick={onCancel} className="text-white/30 hover:text-white hover:bg-white/10 transition-all duration-300">
                    Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white shadow-[0_0_15px_rgba(13,148,136,0.3)]">Save Changes</Button>
            </div>
        </form>
    );
};

export default DynamicActionForm;
