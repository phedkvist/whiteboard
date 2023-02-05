import { isAfter, subMinutes } from "date-fns";
import React from "react";

export interface Cursor {
  id: string;
  position: {
    x: number;
    y: number;
  };
  lastUpdated: string; // ISO-timestamp
  color: string;
}

const Cursors = ({ cursors }: { cursors: Cursor[] }) => {
  // Filter out cursors that are still active
  // TODO: This needs to be placed inside a useEffect.
  const activeCursors = cursors.filter((c) =>
    isAfter(new Date(c.lastUpdated), subMinutes(new Date(), 1))
  );

  return (
    <div>
      {activeCursors.map((c) => (
        <Cursor key={c.id} {...c} />
      ))}
    </div>
  );
};

const Cursor = ({ id, color, position }: Cursor) => (
  <svg
    data-testid={id}
    key={id}
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    version="1.1"
    id="Layer_1"
    x={position.x}
    y={position.y}
    width="35px"
    height="35px"
    viewBox="0 0 28 28"
    enableBackground="new 0 0 28 28"
    xmlSpace="preserve"
  >
    <polygon
      fill="#FFFFFF"
      points="8.2,20.9 8.2,4.9 19.8,16.5 13,16.5 12.6,16.6 "
    />
    <polygon fill="#FFFFFF" points="17.3,21.6 13.7,23.1 9,12 12.7,10.5 " />
    <rect
      x="12.5"
      y="13.6"
      transform="matrix(0.9221 -0.3871 0.3871 0.9221 -5.7605 6.5909)"
      width="2"
      height="8"
      fill={color}
    />
    <polygon
      fill={color}
      points="9.2,7.3 9.2,18.5 12.2,15.6 12.6,15.5 17.4,15.5 "
    />
  </svg>
);

export default Cursors;
