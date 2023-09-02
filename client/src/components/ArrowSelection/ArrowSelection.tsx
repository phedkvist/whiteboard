import { useState } from "react";
import styled from "styled-components";

const LeftArrowSvg = () => (
  <svg
    width="34"
    height="35"
    viewBox="0 0 34 35"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="33.1081" height="35" rx="2" fill="#F0F0F0" />
    <path
      d="M9.00002 25L25 8M25 8L19.1778 9.10904M25 8L24.8933 13.0622"
      stroke="black"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.99121 25.5H4.69141V32.2188H6.41504V33H1.99121V32.2188H3.78809V26.2861H1.99121V25.5Z"
      fill="black"
    />
  </svg>
);

const RightArrowSvg = () => (
  <svg
    width="35"
    height="35"
    viewBox="0 0 35 35"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="35" height="35" rx="2" fill="#F0F0F0" />
    <path
      d="M6.31152 27.6191C6.47754 27.6191 6.65007 27.6305 6.8291 27.6533C7.01139 27.6761 7.14811 27.707 7.23926 27.7461L7.11719 28.6299C6.94141 28.5908 6.77376 28.5632 6.61426 28.5469C6.45801 28.5273 6.29362 28.5176 6.12109 28.5176C5.89974 28.5176 5.69954 28.5452 5.52051 28.6006C5.34147 28.6527 5.18522 28.7308 5.05176 28.835C4.93132 28.9261 4.82552 29.0384 4.73438 29.1719C4.64648 29.3021 4.57324 29.4486 4.51465 29.6113V33H3.60645V27.7168H4.46582L4.50488 28.4248L4.50977 28.5566C4.72461 28.2669 4.98177 28.0391 5.28125 27.873C5.58398 27.7038 5.92741 27.6191 6.31152 27.6191Z"
      fill="black"
    />
    <path
      d="M9 25L25 8M25 8L19.1777 9.10904M25 8L24.8933 13.0622"
      stroke="black"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NoArrowSvg = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="30" height="30" rx="2" fill="#F0F0F0" />
    <path
      d="M10 23L22 8"
      stroke="black"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SlimArrowSvg = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="30" height="30" rx="2" fill="#F0F0F0" />
    <path
      d="M10 23L22 8M22 8L17.6333 8.97857M22 8L21.92 12.4666"
      stroke="black"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ThickArrowSvg = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="30" height="30" rx="2" fill="#F0F0F0" />
    <path d="M19.5385 11.0769L22 8L17.2 9.25L19.5385 11.0769Z" fill="black" />
    <path d="M22 13V8L19.5385 11.0769L22 13Z" fill="black" />
    <path
      d="M10 23L19.5385 11.0769M22 8L17.2 9.25L19.5385 11.0769M22 8V13L19.5385 11.0769M22 8L19.5385 11.0769"
      stroke="black"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Container = styled.div`
  position: relative;
`;

const Button = styled.button`
  border: none;
  &:hover {
    cursor: pointer;
  }
`;

const List = styled.ul`
  position: absolute;
  list-style-type: none;
  margin: 10px 0;
  padding: 10px;
  z-index: 2;
  display: flex;
  flex-direction: row;
  gap: 10px;

  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 2px;
`;

const ListItem = styled.li`
  margin: 0;
  background-color: white;

  &:hover {
    background-color: lightgray;
  }
`;

export enum Side {
  left = "left",
  right = "right",
}

export enum ArrowOption {
  none = "none",
  slim = "slim",
  thick = "thick",
}

const ArrowButtonDropdown = ({
  side,
  openSide,
  toggleIsOpen,
  onSelectArrow,
}: {
  side: Side | null;
  openSide: Side | null;
  toggleIsOpen: () => void;
  onSelectArrow: (arrow: ArrowOption) => void;
}) => {
  return (
    <Container>
      <Button
        onClick={toggleIsOpen}
        data-testid={side === Side.left ? "left-arrow-btn" : "right-arrow-btn"}
      >
        {side === Side.left ? <LeftArrowSvg /> : <RightArrowSvg />}
      </Button>
      {openSide === side ? (
        <List>
          <ListItem>
            <Button
              onClick={() => onSelectArrow(ArrowOption.none)}
              data-testid="arrow-none"
            >
              <NoArrowSvg />
            </Button>
          </ListItem>
          <ListItem>
            <Button
              onClick={() => onSelectArrow(ArrowOption.slim)}
              data-testid="arrow-slim"
            >
              <SlimArrowSvg />
            </Button>
          </ListItem>
          <ListItem>
            <Button
              onClick={() => onSelectArrow(ArrowOption.thick)}
              data-testid="arrow-thick"
            >
              <ThickArrowSvg />
            </Button>
          </ListItem>
        </List>
      ) : null}
    </Container>
  );
};

export interface ArrowSelectionProps {
  onSelectArrowOption: (side: Side, option: ArrowOption) => void;
}

export const ArrowSelection = ({
  onSelectArrowOption,
}: ArrowSelectionProps) => {
  const [openSide, setOpenSide] = useState<Side | null>(null);

  const onSelectArrow = (arrowOption: ArrowOption) => {
    // TODO: Make a change update.
    if (!openSide) return;
    onSelectArrowOption(openSide, arrowOption);
    setOpenSide(null);
  };
  return (
    <>
      <ArrowButtonDropdown
        side={Side.left}
        openSide={openSide}
        toggleIsOpen={() =>
          openSide === Side.left ? setOpenSide(null) : setOpenSide(Side.left)
        }
        onSelectArrow={onSelectArrow}
      />
      <ArrowButtonDropdown
        side={Side.right}
        openSide={openSide}
        toggleIsOpen={() =>
          openSide === Side.right ? setOpenSide(null) : setOpenSide(Side.right)
        }
        onSelectArrow={onSelectArrow}
      />
    </>
  );
};
