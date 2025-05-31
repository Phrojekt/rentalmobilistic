"use client";

import { useState } from "react";
import { carService } from "@/services/carService";
import { toast } from 'react-hot-toast';

interface UpdateAvailabilityModalProps {
  carId: string;
  currentAvailability: 'available' | 'rented' | 'maintenance';
  onClose: () => void;
  onUpdate: () => void;
}

export default function UpdateAvailabilityModal({
  carId,
  currentAvailability,
  onClose,
  onUpdate
}: UpdateAvailabilityModalProps) {
  const [availability, setAvailability] = useState<'available' | 'rented' | 'maintenance'>(currentAvailability);
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      if (currentAvailability === 'rented' && availability === 'available') {
        const confirm = window.confirm(
          'Changing status to available will cancel the current rental. Are you sure?'
        );
        
        if (!confirm) {
          setUpdating(false);
          return;
        }
      }

      await carService.updateCarAvailability(carId, availability);
      
      toast.success('Car availability updated successfully');
      if (currentAvailability === 'rented' && availability === 'available') {
        toast.success('Current rental has been cancelled');
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update car availability');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-black mb-4">Update Availability</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#000000] mb-2">
              Availability Status
            </label>
            <select
              className="text-black w-full p-2 border rounded-lg"
              value={availability}
              onChange={(e) => setAvailability(e.target.value as 'available' | 'rented' | 'maintenance')}
            >
              <option value="available">Available</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="rented">Rented</option>
            </select>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-[#676773] hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-[#EA580C] text-white rounded-lg hover:bg-[#EA580C]/90 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
