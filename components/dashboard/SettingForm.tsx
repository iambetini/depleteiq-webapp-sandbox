"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Plus, Save, Trash2, X } from "lucide-react";
import React, { useCallback, useState } from "react";

export interface KeyValueSetting {
  uuid?: string;
  key: string;
  sub_key: string;
  value: string;
  description?: string;
  status?: string;
  created_at?: string;
}

interface SettingsPairsProps {
  title: string;
  parentKey: string;
  allowModifyPairs: boolean;
  initialValues: KeyValueSetting[];
  onSave: (settings: Array<{ sub_key: string; value: string }>) => Promise<void>;
  onDelete?: (uuid: string) => Promise<void>;
  loading?: boolean;
}

export default function SettingForm({
  title,
  parentKey,
  allowModifyPairs,
  initialValues,
  onSave,
  onDelete,
  loading,
}: SettingsPairsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [settingsList, setSettingsList] = useState<KeyValueSetting[]>(initialValues);
  const [isLoading, setIsLoading] = useState(!!loading);

  React.useEffect(() => {
    setSettingsList(initialValues);
  }, [initialValues]);

  const handleEdit = useCallback(() => setIsEditing(true), []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setSettingsList(initialValues);
  }, [initialValues]);

  const handleSubKeyChange = useCallback((index: number, newSubKey: string) => {
    setSettingsList(prev => prev.map((setting, i) => (i === index ? { ...setting, sub_key: newSubKey } : setting)));
  }, []);

  const handleValueChange = useCallback((index: number, newValue: string) => {
    setSettingsList(prev => prev.map((setting, i) => (i === index ? { ...setting, value: newValue } : setting)));
  }, []);

  const handleAddField = useCallback(() => {
    const newSetting: KeyValueSetting = {
      uuid: "",
      key: parentKey,
      sub_key: "",
      value: "",
      description: "",
      status: "active",
      created_at: new Date().toISOString(),
    };
    setSettingsList(prev => [...prev, newSetting]);
  }, [parentKey]);

  const handleRemoveField = useCallback(async (index: number) => {
    const settingToRemove = settingsList[index];
    if (settingToRemove.uuid && onDelete) {
      try {
        await onDelete(settingToRemove.uuid);
      } catch (e) {
        return;
      }
    }
    setSettingsList(prev => prev.filter((_, i) => i !== index));
  }, [settingsList, onDelete]);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload = settingsList
        .filter(s => s.sub_key.trim() && s.value.trim())
        .map(s => ({ sub_key: s.sub_key.trim(), value: s.value.trim() }));
      await onSave(payload);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  }, [settingsList, onSave]);

  const editingBody = (
    <div className="space-y-4">
      {settingsList.map((setting, index) => (
        <div key={index} className="flex items-end space-x-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`sub_key-${index}`}>Setting Name</Label>
              <Input
                id={`sub_key-${index}`}
                value={setting.sub_key}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSubKeyChange(index, e.target.value)}
                placeholder={parentKey === "order" ? "e.g., minimum_order_amount" : "e.g., minimum_order_delivery"}
                className="mt-1"
                disabled={!allowModifyPairs}
                readOnly={!allowModifyPairs}
              />
            </div>
            <div>
              <Label htmlFor={`value-${index}`}>Value</Label>
              <Input
                id={`value-${index}`}
                value={setting.value}
                onChange={(e) => handleValueChange(index, e.target.value)}
                placeholder="Enter setting value"
                className="mt-1"
              />
            </div>
          </div>
          {allowModifyPairs && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemoveField(index)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      {allowModifyPairs && (
        <Button
          variant="outline"
          onClick={handleAddField}
          className="w-full border-dashed border-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Setting
        </Button>
      )}

      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading} className="btn-primary">
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );

  const viewBody = (
    <div className="space-y-3">
      {settingsList.length > 0 ? (
        settingsList.map((setting, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{setting.sub_key}</p>
                  <p className="text-sm text-gray-500 truncate">{setting.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No {parentKey} settings configured yet.</p>
          <p className="text-sm mt-1">
            Click &quot;Edit Settings&quot; to {allowModifyPairs ? "add configuration parameters" : "view configuration parameters"}.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {isEditing ? (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Editing Mode
            </Badge>
          ) : (
            <Button onClick={handleEdit} className="btn-primary">
              <Edit className="mr-2 h-4 w-4" />
              Edit Settings
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? `Modify the ${parentKey} settings below. You can ${allowModifyPairs ? "add, remove, and " : ""}edit key-value pairs.`
            : `View current ${parentKey} configuration settings.`}
        </CardDescription>
      </CardHeader>
      <CardContent>{isEditing ? editingBody : viewBody}</CardContent>
    </Card>
  );
}
