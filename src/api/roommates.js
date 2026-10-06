import client from "./client";

// Matches the backend ClassYear enum; the API stores the index.
export const CLASS_YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
export const AGE_MIN = 16;
export const AGE_MAX = 100;

// Every filter is optional; gender, major, and interest ignore case.
export const getRoommates = ({ userId, gender, year, major, interest } = {}) =>
  client.get("Roommate", {
    params: {
      userId: userId || undefined,
      gender: gender || undefined,
      year,
      major: major || undefined,
      interest: interest || undefined,
    },
  });

export const getRoommate = (id) => client.get(`Roommate/${id}`);

// Resolves to the user's bio, or null when they haven't made one.
export const getUserRoommate = async (userId) => {
  const [bio] = await getRoommates({ userId });
  return bio ?? null;
};

export const createRoommate = (bio) => client.post("Roommate", bio);
export const updateRoommate = (bio) => client.put("Roommate", bio);
export const deleteRoommate = (id) => client.delete(`Roommate/${id}`);
