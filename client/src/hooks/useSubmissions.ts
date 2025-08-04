import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { fetchUserSubmissions } from '../utils/submissions';

export interface UseSubmissionsReturn {
  existingSubmissions: string;
  existingOpSubmissions: string;
  submitToBackend: (formDataStr: string) => Promise<boolean>;
  fetchUserSubmissionsFromWP: (matchDay: number, op?: boolean) => Promise<void>;
}

export function useSubmissions(
  renderMatchDay: number, 
  fakeDataEnabled = false,
  seasonYear?: number
): UseSubmissionsReturn {
  const [existingSubmissions, setExistingSubmissions] = useState('');
  const [existingOpSubmissions, setExistingOpSubmissions] = useState('');

  const opUserId = import.meta.env.VITE_OP_USER_ID || 'shaahin@gmail.com';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const wpAdminUrl = import.meta.env.VITE_WP_ADMIN_URL || '/wp-admin/admin-ajax.php';

  const submitToBackend = useCallback(async (formDataStr: string): Promise<boolean> => {
    const formData = new FormData();
    formData.append("dataStr", formDataStr);
    formData.append("matchDay", renderMatchDay.toString());
    formData.append("userId", localStorage.getItem("socculi_user_email") ?? "");
    formData.append("seasonYear", (seasonYear || new Date().getFullYear()).toString());
    
    console.log('submitToBackend formData: ', formData);
    
    try {
      const response = await axios.post(
        `${apiBaseUrl}${wpAdminUrl}?action=submit_user_predictions`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log('Submission response:', response);
      toast.success("Predictions submitted successfully.");
      return true;
    } catch (error) {
      console.error("submitToBackend error", error);
      toast.error("Error occurred while submitting predictions. Please try again.");
      return false;
    }
  }, [renderMatchDay, apiBaseUrl, wpAdminUrl, seasonYear]);

  const fetchUserSubmissionsFromWP = useCallback(async (matchDay: number, op = false): Promise<void> => {
    try {
      const userId = op ? opUserId : (localStorage.getItem("socculi_user_email") ?? "");
      const predictions = await fetchUserSubmissions(matchDay, userId, fakeDataEnabled, seasonYear);

      if (op) {
        setExistingOpSubmissions(predictions);
      } else {
        setExistingSubmissions(predictions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error("Failed to load predictions");
    }
  }, [opUserId, fakeDataEnabled, seasonYear]);

  // Auto-fetch submissions when matchDay changes
  useEffect(() => {
    if (renderMatchDay > 0) {
      fetchUserSubmissionsFromWP(renderMatchDay, false);
      fetchUserSubmissionsFromWP(renderMatchDay, true);
    }
  }, [renderMatchDay, fetchUserSubmissionsFromWP]);

  return {
    existingSubmissions,
    existingOpSubmissions,
    submitToBackend,
    fetchUserSubmissionsFromWP,
  };
}