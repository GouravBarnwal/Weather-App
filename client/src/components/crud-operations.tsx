import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { CustomDatePicker } from "./custom-date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { WeatherRecord } from "@shared/schema";
// Custom styles for react-datepicker to fix z-index and positioning
import "react-datepicker/dist/react-datepicker.css";
import "./date-picker-fix.css";

export default function CrudOperations() {
  const [newRecord, setNewRecord] = useState({
    location: "",
    startDate: new Date(),
    endDate: null as Date | null,
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

  const handleInputChange = (field: string, value: Date | null) => {
    setNewRecord(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
        searchDate: new Date().toISOString(),
        startDate: data.startDate ? format(data.startDate, 'yyyy-MM-dd') : null,
        endDate: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : null,
        condition: data.condition || "Unknown",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
      setNewRecord({ 
        location: "", 
        startDate: new Date(), 
        endDate: null, 
        temperature: "", 
        description: "" 
      });
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

  const exportToPDF = () => {
    // Import jsPDF dynamically to avoid SSR issues
    import('jspdf').then(({ jsPDF }) => {
      import('jspdf-autotable').then((autoTable) => {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.text('Weather Records', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        
        // Prepare data for the table
        const tableData = records.map(record => ({
          location: record.location,
          startDate: record.startDate ? format(new Date(record.startDate), 'MMM d, yyyy') : 'N/A',
          endDate: record.endDate ? format(new Date(record.endDate), 'MMM d, yyyy') : 'N/A',
          temperature: `${record.temperature}°C`,
          description: record.description || 'N/A',
          date: format(new Date(record.searchDate), 'MMM d, yyyy')
        }));
        
        // Generate table
        autoTable.default(doc, {
          head: [['Location', 'Start Date', 'End Date', 'Temperature', 'Description', 'Record Date']],
          body: tableData.map(item => [
            item.location,
            item.startDate,
            item.endDate,
            item.temperature,
            item.description,
            item.date
          ]),
          startY: 30,
          styles: {
            fontSize: 9,
            cellPadding: 2,
            overflow: 'linebreak',
            valign: 'middle',
          },
          headStyles: {
            fillColor: [59, 130, 246], // Blue header
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          margin: { top: 10 }
        });
        
        // Add footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.width - 25,
            doc.internal.pageSize.height - 10
          );
        }
        
        // Save the PDF
        doc.save(`weather-records-${new Date().toISOString().split('T')[0]}.pdf`);
      });
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Weather Data</h3>
        <button
          onClick={exportToPDF}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          title="Export all weather data as PDF"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </button>
      </div>
      
      <div className="space-y-4">
        
        {/* CREATE Operation */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Add New Weather Record</h4>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder="Location"
              value={newRecord.location}
              onChange={(e) => setNewRecord(prev => ({ ...prev, location: e.target.value }))}
              className="text-base"
            />
            <div className="space-y-2 w-full">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <CustomDatePicker
                    selected={newRecord.startDate}
                    onChange={(date) => handleInputChange('startDate', date)}
                    placeholderText="Select start date"
                    minDate={new Date('2000-01-01')}
                    maxDate={new Date('2100-12-31')} // Allow future dates up to end of 2100
                    selectsStart
                    startDate={newRecord.startDate}
                    endDate={newRecord.endDate}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <CustomDatePicker
                    selected={newRecord.endDate}
                    onChange={(date) => handleInputChange('endDate', date)}
                    placeholderText="Select end date"
                    minDate={newRecord.startDate || new Date('2000-01-01')}
                    maxDate={new Date('2100-12-31')} // Allow future dates up to end of 2100
                    selectsEnd
                    startDate={newRecord.startDate}
                    endDate={newRecord.endDate}
                    className="w-full"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {`Selected: ${format(newRecord.startDate, 'MMMM d, yyyy')}`}
                {newRecord.endDate ? ` to ${format(newRecord.endDate, 'MMMM d, yyyy')}` : ''}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Temperature (°C)"
                value={newRecord.temperature}
                onChange={(e) => setNewRecord(prev => ({ ...prev, temperature: e.target.value }))}
                className="text-base"
              />
              <Input
                placeholder="Description"
                value={newRecord.description}
                onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
                className="text-base"
              />
            </div>
            <Button 
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-3 text-base h-12 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded text-sm font-medium transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              {createMutation.isPending ? "Creating..." : "Create Record"}
            </Button>
          </form>
        </div>

        {/* UPDATE Operation */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Update Selected Record</h4>
          <form onSubmit={handleUpdate} className="space-y-4">
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
              className="w-full bg-weather-blue hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600 text-white py-2 rounded text-sm font-medium transition-colors"
            >
              <i className="fas fa-edit mr-1"></i>
              {updateMutation.isPending ? "Updating..." : "Update Record"}
            </Button>
          </form>
        </div>

        {/* DELETE Operation */}
        <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
          <h4 className="font-medium text-destructive mb-3">Delete Record</h4>
          <form onSubmit={handleDelete} className="space-y-3">
            <Select value={deleteRecordId} onValueChange={setDeleteRecordId}>
              <SelectTrigger className="w-full text-sm border-destructive/30 focus:ring-destructive/50">
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
              className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white py-2 rounded text-sm font-medium transition-colors"
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
