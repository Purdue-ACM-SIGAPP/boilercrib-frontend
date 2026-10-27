import client from "./client";

export const RATING_MIN = 1;
export const RATING_MAX = 10;

export const getReviews = ({ mostRecent, keywords } = {}) =>
  client.get("Review", { params: { mostRecent, keywords: keywords || undefined } });

export const getReview = (id) => client.get(`Review/${id}`);
export const createReview = (review) => client.post("Review", review);
export const updateReview = (review) => client.put("Review", review);
export const deleteReview = (id) => client.delete(`Review/${id}`);

export const getBuildingReviews = (buildingId) => client.get(`Review/building/${buildingId}`);
export const getUserReviews = (userId) => client.get(`Review/user/${userId}`);
export const deleteBuildingReviews = (buildingId) => client.delete(`Review/building/${buildingId}`);

// Resolves to the average rating (1–10), or null when the building has no reviews.
export const getAverageRating = async (buildingId) => {
  const average = await client.get(`Review/building/average/${buildingId}`);
  return typeof average === "number" && average >= 0 ? average : null;
};

export const flagReview = (id) => client.post("Review/flag", null, { params: { id } });
