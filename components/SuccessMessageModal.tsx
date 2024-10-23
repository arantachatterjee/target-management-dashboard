/**
 * Modal props
 * Message - success message to be displayed to the end user when an operation succeeds
 * OnClose - function which defines any actions to be taken upon close, such as fetching latest data
 */
interface ModalProps {
    message: string;
    onClose: () => void;
  }
  
  // Functional component for displaying a modal
  export default function Modal({ message, onClose }: ModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <p className="text-lg font-medium mb-4">{message}</p>
            <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-400 text-white py-2 px-4 rounded"
            >
                OK
            </button>
            </div>
        </div>
    );
}