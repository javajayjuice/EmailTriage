import { useTicket } from '@/app/providers/ticket/TicketContext';
import { Ticket, Label } from '@/models';
import React, { useState, useEffect } from 'react';

interface TicketLabelUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTicket: Ticket;
    onLabelUpdated: () => void;
    labels: Label[];
    labelsLoading: boolean;
}

const TicketLabelUpdateModal: React.FC<TicketLabelUpdateModalProps> = ({
    isOpen,
    onClose,
    selectedTicket,
    onLabelUpdated,
    labels,
    labelsLoading,
}) => {
    const [selectedLabelId, setSelectedLabelId] = useState<string>('');
    const [updateLoading, setUpdateLoading] = useState<boolean>(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const { updateTicket, setSelectedTicket } = useTicket();

    // Reset state and set initial values when the modal opens or ticket changes
    useEffect(() => {
        if (isOpen && selectedTicket) {
            setSelectedLabelId(selectedTicket.labelId || '');
            setUpdateError(null);
        }
    }, [isOpen, selectedTicket]);

    const handleCloseEditModal = () => {
        setSelectedLabelId('');
        setUpdateError(null);
        onClose();
    };

    const handleUpdateTicket = async () => {
        // Validate that there's an actual change to be made
        if (!selectedLabelId) {
            setUpdateError('Please select a label');
            return;
        }

        if (selectedLabelId === selectedTicket.labelId) {
            setUpdateError('No changes to save');
            return;
        }

        setUpdateLoading(true);
        setUpdateError(null);

        try {
            // Find the selected label object for more complete data
            const selectedLabel = labels.find(label => label.id === selectedLabelId);

            // Update ticket on the server
            await updateTicket({
                ...selectedTicket,
                labelId: selectedLabelId
            });

            // Update local state
            setSelectedTicket({
                ...selectedTicket,
                labelId: selectedLabelId,
                label: selectedLabel || selectedTicket.label
            });

            // Call the callback to notify parent components
            onLabelUpdated();
            handleCloseEditModal();
        } catch (error) {
            console.error('Failed to update ticket label:', error);
            setUpdateError(error instanceof Error ? error.message : 'Failed to update ticket label');
        } finally {
            setUpdateLoading(false);
        }
    };

    // Don't render anything if modal is closed
    if (!isOpen) return null;

    return (
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Update Ticket Label</h2>

                {updateError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                        {updateError}
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="labelSelect" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Label
                    </label>
                    <select
                        id="labelSelect"
                        value={selectedLabelId}
                        onChange={(e) => setSelectedLabelId(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={labelsLoading || updateLoading}
                    >
                        <option value="">Select a label</option>
                        {labels.map((label) => (
                            <option key={label.id} value={label.id}>
                                {label.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        onClick={handleCloseEditModal}
                        disabled={updateLoading}
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${updateLoading || selectedLabelId === selectedTicket.labelId || !selectedLabelId
                                ? "opacity-70 cursor-not-allowed"
                                : "hover:bg-blue-600"
                            }`}
                        onClick={handleUpdateTicket}
                        disabled={updateLoading || selectedLabelId === selectedTicket.labelId || !selectedLabelId}
                        type="button"
                    >
                        {updateLoading ? "Updating..." : "Update Label"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketLabelUpdateModal;