import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">About This App</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-sm text-gray-600">
          <p><strong>Developer:</strong> Gourav Barnwal</p>
          
          <div>
            <p className="font-medium text-gray-900 mb-2">About PM Accelerator:</p>
            <p>The Product Manager Accelerator Program is designed to support PM professionals through every stage of their careers. From students looking for entry-level jobs to Directors looking to take on a leadership role, our program has helped over hundreds of students fulfill their career aspirations.</p>
          </div>
          
          <div>
            <p className="font-medium text-gray-900 mb-2">Services we offer:</p>
            <ul className="space-y-1 text-xs">
              <li>🚀 <strong>PMA Pro:</strong> End-to-end product manager job hunting program</li>
              <li>🚀 <strong>AI PM Bootcamp:</strong> Hands-on AI Product Management skills</li>
              <li>🚀 <strong>PMA Power Skills:</strong> Leadership and presentation skills</li>
              <li>🚀 <strong>PMA Leader:</strong> Executive level advancement</li>
              <li>🚀 <strong>1:1 Resume Review:</strong> Killer product manager resume rewriting</li>
            </ul>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <a 
              href="https://www.linkedin.com/company/product-manager-accelerator" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-weather-blue hover:text-blue-600 font-medium"
            >
              <i className="fab fa-linkedin"></i>
              <span>Visit PM Accelerator on LinkedIn</span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
