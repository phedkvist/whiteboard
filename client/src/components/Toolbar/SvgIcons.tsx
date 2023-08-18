interface SvgIconProp {
  color: string;
}

export const PointerSvg = ({ color }: SvgIconProp) => (
  <svg
    width="15"
    height="17"
    viewBox="0 0 15 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.87202 15.5572L0.59485 2.39002C0.37804 1.51891 1.3299 0.825456 2.09261 1.29886L13.7281 8.52088C14.5139 9.00863 14.2733 10.2101 13.3603 10.3577L8.79578 11.0955C8.49514 11.1441 8.23303 11.327 8.08374 11.5925L5.71402 15.8059C5.27036 16.5947 4.0906 16.4354 3.87202 15.5572Z"
      stroke={color}
    />
  </svg>
);

export const RectSvg = ({ color }: SvgIconProp) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="17.5"
      y="0.5"
      width="17"
      height="17"
      rx="0.5"
      transform="rotate(90 17.5 0.5)"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const EllipseSvg = ({ color }: SvgIconProp) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="9" cy="9" r="8.5" transform="rotate(90 9 9)" stroke={color} />
  </svg>
);

export const DiamondSvg = ({ color }: SvgIconProp) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="17.2929"
      y="8.74261"
      width="11.3639"
      height="11.3639"
      rx="0.5"
      transform="rotate(135 17.2929 8.74261)"
      stroke={color}
    />
  </svg>
);

export const TextSvg = ({ color }: SvgIconProp) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 1L2 1C1.44772 1 1 1.44772 1 2V3M9 1L16 1C16.5523 1 17 1.44772 17 2V3M9 1L9 17"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const LineSvg = ({ color }: SvgIconProp) => (
  <svg
    width="15"
    height="19"
    viewBox="0 0 15 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.33839 17.6687L14.4224 1.48941M14.4224 1.48941L9.66123 2.54491M14.4224 1.48941L14.3351 6.30719"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
