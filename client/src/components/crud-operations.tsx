import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { WeatherRecord } from "@shared/schema";

export default function CrudOperations() {
  const [newRecord, setNewRecord] = useState({
    location: "",
    startDate: "",
    endDate: "",
    temperature: "",
    description: "",
  });
  
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [updateData, setUpdateData] = useState({
    location: "",
    temperature: "",
    description: "",
  });
  
  const [deleteRecordId, setDeleteRecordId] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: records = [] } = useQuery<WeatherRecord[]>({
    queryKey: ["/api/weather"],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/weather", {
        ...data,
        temperature: parseFloat(data.temperature),
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
      setNewRecord({ location: "", startDate: "", endDate: "", temperature: "", description: "" });
      toast({
        title: "Record created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create record",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/weather/${id}`, {
        ...data,
        temperature: data.temperature ? parseFloat(data.temperature) : undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
      setSelectedRecordId("");
      setUpdateData({ location: "", temperature: "", description: "" });
      toast({
        title: "Record updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update record",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/weather/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
      setDeleteRecordId("");
      toast({
        title: "Record deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete record",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.location || !newRecord.temperature || !newRecord.description) {
      toast({
        title: "Missing required fields",
        description: "Location, temperature, and description are required",
        variant: "destructive",
      });
      return;
    }
    
    if (newRecord.startDate && newRecord.endDate) {
      const start = new Date(newRecord.startDate);
      const end = new Date(newRecord.endDate);
      if (start > end) {
        toast({
          title: "Invalid date range",
          description: "Start date must be before end date",
          variant: "destructive",
        });
        return;
      }
    }
    
    createMutation.mutate(newRecord);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordId) {
      toast({
        title: "No record selected",
        description: "Please select a record to update",
        variant: "destructive",
      });
      return;
    }

    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== "")
    );

    updateMutation.mutate({ id: selectedRecordId, data: cleanData });
  };

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteRecordId) {
      toast({
        title: "No record selected",
        description: "Please select a record to delete",
        variant: "destructive",
      });
      return;
    }
    deleteMutation.mutate(deleteRecordId);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Weather Data</h3>
      
      <div className="space-y-4">
        
        {/* CREATE Operation */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Add New Weather Record</h4>
          <form onSubmit={handleCreate} className="space-y-3">
            <Input
              placeholder="Location"
              value={newRecord.location}
              onChange={(e) => setNewRecord(prev => ({ ...prev, location: e.target.value }))}
              className="text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={newRecord.startDate}
                onChange={(e) => setNewRecord(prev => ({ ...prev, startDate: e.target.value }))}
                className="text-sm"
              />
              <Input
                type="date"
                value={newRecord.endDate}
                onChange={(e) => setNewRecord(prev => ({ ...prev, endDate: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Temperature (°C)"
                value={newRecord.temperature}
                onChange={(e) => setNewRecord(prev => ({ ...prev, temperature: e.target.value }))}
                className="text-sm"
              />
              <Input
                placeholder="Description"
                value={newRecord.description}
                onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
                className="text-sm"
              />
            </div>
            <Button 
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-green-500 text-white py-2 rounded text-sm font-medium hover:bg-green-600 transition-colors"
            >
              <i className="fas fa-plus mr-1"></i>
              {createMutation.isPending ? "Creating..." : "Create Record"}
            </Button>
          </form>
        </div>

        {/* UPDATE Operation */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Update Selected Record</h4>
          <form onSubmit={handleUpdate} className="space-y-3">
            <Select value={selectedRecordId} onValueChange={setSelectedRecordId}>
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select record to update..." />
              </SelectTrigger>
              <SelectContent>
                {records.map((record) => (
                  <SelectItem key={record.id} value={record.id}>
                    {record.location} - {new Date(record.searchDate).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="New location"
              value={updateData.location}
              onChange={(e) => setUpdateData(prev => ({ ...prev, location: e.target.value }))}
              className="text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="New temperature"
                value={updateData.temperature}
                onChange={(e) => setUpdateData(prev => ({ ...prev, temperature: e.target.value }))}
                className="text-sm"
              />
              <Input
                placeholder="New description"
                value={updateData.description}
                onChange={(e) => setUpdateData(prev => ({ ...prev, description: e.target.value }))}
                className="text-sm"
              />
            </div>
            <Button 
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full bg-weather-blue text-white py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              <i className="fas fa-edit mr-1"></i>
              {updateMutation.isPending ? "Updating..." : "Update Record"}
            </Button>
          </form>
        </div>

        {/* DELETE Operation */}
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <h4 className="font-medium text-red-900 mb-3">Delete Record</h4>
          <form onSubmit={handleDelete} className="space-y-3">
            <Select value={deleteRecordId} onValueChange={setDeleteRecordId}>
              <SelectTrigger className="w-full text-sm border-red-300 focus:ring-red-500">
                <SelectValue placeholder="Select record to delete..." />
              </SelectTrigger>
              <SelectContent>
                {records.map((record) => (
                  <SelectItem key={record.id} value={record.id}>
                    {record.location} - {new Date(record.searchDate).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              type="submit"
              disabled={deleteMutation.isPending}
              className="w-full bg-red-500 text-white py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors"
            >
              <i className="fas fa-trash mr-1"></i>
              {deleteMutation.isPending ? "Deleting..." : "Delete Record"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
