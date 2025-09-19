"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { settings } from "@/store/settings";
import { toast } from "@/hooks/use-toast";
import { Setting } from "@/types/setting";

export default function DeliveriesSettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [settingsList, setSettingsList] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const allowModifyPairs = useMemo(() => 
    (process.env.NEXT_PUBLIC_ALLOW_MODIFY_PAIRS ?? "true") === "true", 
    []
  );

  const { data } = settings.useGetAllQuery({
    params: { key: "delivery" }
  });

  const settingsData = (data as any)?.data?.items;
  const [createSettings] = settings.useCreateMutation();
  const [deleteSettings] = settings.useDeleteMutation();

  // Helper function to map API data to Setting objects
  const mapToSettings = useCallback((data: Setting[]) => 
    data.map((setting: Setting) => ({
      uuid: setting.uuid,
      key: setting.key,
      sub_key: setting.sub_key,
      value: setting.value,
      description: setting.description || "",
      status: setting.status || "active",
      created_at: setting.created_at
    })), []
  );

  React.useEffect(() => {
    if (settingsData) {
      setSettingsList(mapToSettings(settingsData));
    }
  }, [settingsData, mapToSettings]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    if (settingsData) {
      setSettingsList(mapToSettings(settingsData));
    }
  }, [settingsData, mapToSettings]);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      const settingsPayload = settingsList
        .filter(setting => setting.sub_key.trim() && setting.value.trim())
        .map(setting => ({
          key: "delivery",
          sub_key: setting.sub_key.trim(),
          value: setting.value.trim()
        }));

      if (settingsPayload.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one setting",
          variant: "destructive",
        });
        return;
      }

      await createSettings({
        data: { settings: settingsPayload } as any
      }).unwrap();

      toast({
        title: "Success",
        description: "Delivery settings updated successfully",
      });

      setIsLoading(false);
      setIsEditing(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  }, [settingsList, createSettings]);

  const handleSubKeyChange = useCallback((index: number, newSubKey: string) => {
    setSettingsList(prev => 
      prev.map((setting, i) => 
        i === index ? { ...setting, sub_key: newSubKey } : setting
      )
    );
  }, []);

  const handleValueChange = useCallback((index: number, newValue: string) => {
    setSettingsList(prev => 
      prev.map((setting, i) => 
        i === index ? { ...setting, value: newValue } : setting
      )
    );
  }, []);

  const handleAddField = useCallback(() => {
    const newSetting: Setting = {
      uuid: "",
      key: "delivery",
      sub_key: "",
      value: "",
      description: "",
      status: "active",
      created_at: new Date().toISOString()
    };
    setSettingsList(prev => [...prev, newSetting]);
  }, []);

  const handleRemoveField = useCallback(async (index: number) => {
    const settingToRemove = settingsList[index];

    if (settingToRemove.uuid) {
      try {
        await deleteSettings({ id: settingToRemove.uuid }).unwrap();
        toast({
          title: "Success",
          description: "Setting deleted successfully",
        });
      } catch (error: any) {
        return;
      }
    }

    setSettingsList(prev => prev.filter((_, i) => i !== index));
  }, [settingsList, deleteSettings]);

  const renderEditingMode = () => (
    <div className="space-y-4">
      {settingsList.map((setting, index) => (
        <div key={index} className="flex items-end space-x-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`sub_key-${index}`}>Setting Name</Label>
              <Input
                id={`sub_key-${index}`}
                value={setting.sub_key}
                onChange={(e) => handleSubKeyChange(index, e.target.value)}
                placeholder="e.g., minimum_order_delivery"
                className="mt-1"
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

  const renderViewMode = () => (
    <div className="space-y-3">
      {settingsList.length > 0 ? (
        settingsList.map((setting, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {setting.sub_key}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {setting.value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No delivery settings configured yet.</p>
          <p className="text-sm mt-1">
            Click &quot;Edit Settings&quot; to {allowModifyPairs ? 'add configuration parameters' : 'view configuration parameters'}.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Delivery Settings</span>
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
              ? `Modify the delivery settings below. You can ${allowModifyPairs ? 'add, remove, and ' : ''}edit key-value pairs.`
              : "View current delivery configuration settings."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? renderEditingMode() : renderViewMode()}
        </CardContent>
      </Card>
    </div>
  );
}