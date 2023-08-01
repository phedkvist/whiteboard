import { isAfter, subMinutes } from "date-fns";
import { Cursor } from "../../types";
import { useLayoutEffect, useState } from "react";

const Cursors = ({ cursors }: { cursors: Cursor[] }) => {
  const [activeCursors, setActiveCursors] = useState<Cursor[]>([]);
  useLayoutEffect(() => {
    setActiveCursors(
      cursors.filter((c) =>
        isAfter(new Date(c.lastUpdated), subMinutes(new Date(), 1))
      )
    );
    // eslint-disable-next-line
  }, [JSON.stringify(cursors)]);

  return (
    <>
      {activeCursors.map((c) => (
        <RenderCursor key={c.id} {...c} />
      ))}
    </>
  );
};

// CSS transition animated cursor
const RenderCursor = ({
  color,
  position,
  id,
  username,
}: {
  color: string;
  position: { x: number; y: number };
  id: string;
  username: string;
}) => {
  return (
    <g
      data-testid={id}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: "transform 120ms linear",
      }}
    >
      <CursorSvg color={color} />
      <text fill={color} style={{ fontSize: 14 }} x={10} y={30}>
        {username}
      </text>
    </g>
  );
};

// SVG cursor shape
function CursorSvg({ color }: { color: string }) {
  return (
    <svg width="32" height="44" viewBox="0 0 24 36" fill="none">
      <path
        fill={color}
        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
      />
    </svg>
  );
}

export default Cursors;
