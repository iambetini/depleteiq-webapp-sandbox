"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { deliveries } from "@/store/deliveries";
import { toast } from "@/hooks/use-toast";

interface KeyValuePair {
  key: string;
  value: string;
}

interface DeliverySettings {
  [key: string]: string;
}

export default function DeliveriesSettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState<KeyValuePair[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Configuration variable to control add/remove functionality
  const allowModifyPairs = true; // Set to false to disable adding/removing pairs

  // Fetch settings using the deliveries store with extraPath
  const { data: settingsData, isLoading: isLoadingData, refetch } = deliveries.useGetSingleQuery({
    extraPath: "settings"
  });

  // Update settings mutation
  const [updateSettings] = deliveries.useCreateMutation();

  // Initialize settings when data loads
  React.useEffect(() => {
    if (settingsData && !isLoadingData) {
      const keyValuePairs: KeyValuePair[] = Object.entries(settingsData).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      setSettings(keyValuePairs);
    }
  }, [settingsData, isLoadingData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
    if (settingsData) {
      const keyValuePairs: KeyValuePair[] = Object.entries(settingsData).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      setSettings(keyValuePairs);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Convert key-value pairs back to object
      const settingsObject: DeliverySettings = settings.reduce((acc, { key, value }) => {
        if (key.trim()) {
          acc[key.trim()] = value.trim();
        }
        return acc;
      }, {} as DeliverySettings);

      await updateSettings({
        data: settingsObject,
        extraPath: "settings"
      }).unwrap();

      toast({
        title: "Success",
        description: "Delivery settings updated successfully",
      });

      setIsEditing(false);
      refetch(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyChange = (index: number, newKey: string) => {
    const updatedSettings = [...settings];
    updatedSettings[index].key = newKey;
    setSettings(updatedSettings);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const updatedSettings = [...settings];
    updatedSettings[index].value = newValue;
    setSettings(updatedSettings);
  };

  const handleAddField = () => {
    setSettings([...settings, { key: "", value: "" }]);
  };

  const handleRemoveField = (index: number) => {
    const updatedSettings = settings.filter((_, i) => i !== index);
    setSettings(updatedSettings);
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delivery settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Configuration Settings</span>
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
          {isEditing ? (
            <div className="space-y-4">
              {settings.map((setting, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`key-${index}`}>Key</Label>
                      <Input
                        id={`key-${index}`}
                        value={setting.key}
                        onChange={(e) => handleKeyChange(index, e.target.value)}
                        placeholder="Enter setting key"
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
          ) : (
            <div className="space-y-3">
              {settings.length > 0 ? (
                settings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {setting.key}
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
                  <p>No settings configured yet.</p>
                  <p className="text-sm mt-1">
                    Click "Edit Settings" to {allowModifyPairs ? 'add configuration parameters' : 'view configuration parameters'}.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Delivery Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              Delivery settings allow you to configure various parameters that affect how deliveries are processed and managed in the system.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Configure delivery time windows and constraints</li>
              <li>Set up cost calculation parameters</li>
              <li>Define delivery status workflows</li>
              <li>Manage notification preferences</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}