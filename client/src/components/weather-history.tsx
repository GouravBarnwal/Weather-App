import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { WeatherRecord } from "@shared/schema";

export default function WeatherHistory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery<WeatherRecord[]>({
    queryKey: ["/api/weather"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/weather/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <i className="fas fa-spinner animate-spin text-weather-blue text-xl"></i>
          <span className="text-gray-600">Loading history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Search History</h3>
      </div>
      
      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <i className="fas fa-history text-4xl text-gray-300 mb-4"></i>
            <p>No search history yet</p>
            <p className="text-sm">Search for weather to see records here</p>
          </div>
        ) : (
          records.slice(0, 5).map((record) => (
            <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{record.location}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(record.searchDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {record.temperature}°C, {record.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(record.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-500 hover:text-red-600 p-1"
                    title="Delete Record"
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {records.length > 5 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Showing latest 5 records
        </p>
      )}
    </div>
  );
}
