import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const getRoomId = (params: URLSearchParams) => {
  if (params.has("roomId")) {
    return params.get("roomId") as string;
  } else {
    const uuid = uuidv4();
    return uuid;
  }
};

export const useRoomId = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roomId] = useState(() => getRoomId(searchParams));
  useEffect(() => {
    setSearchParams({ roomId });
  }, [roomId, setSearchParams]);
  return roomId;
};
