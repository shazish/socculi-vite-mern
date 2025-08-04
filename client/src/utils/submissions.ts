import axios from 'axios';

interface SubmissionResponse {
  data: {
    predictions: string;
  };
}

export async function fetchUserSubmissions(
  matchDay: number, 
  userId: string, 
  fakeDataEnabled = false,
  seasonYear?: number
): Promise<string> {
  if (fakeDataEnabled) {
    try {
      const response = await import('../assets/prediction-structure.json');
      const fakePredictionData = response.data;
      console.log('fakePredictionData', fakePredictionData);
      return fakePredictionData;
    } catch (error) {
      console.error('Error fetching fake data:', error);
      throw error;
    }
  }

  if (!matchDay || matchDay === 0) return '';

  const formData = new FormData();
  formData.append("week_id", matchDay.toString());
  formData.append("username", userId);
  formData.append("season_year", (seasonYear || new Date().getFullYear()).toString());

  try {
    const response = await axios.post<SubmissionResponse>(
      `https://socculi.com/wp-admin/admin-ajax.php?action=get_user_week_submission`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Origin, Content-Type"
        },
      }
    );
    
    return response.data.data.predictions;
  } catch (error) {
    console.error("fetchUserSubmissions error:", error);
    throw error;
  }
}