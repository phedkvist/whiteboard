import useContextMenu from "../../hooks/useContextMenu";
import "./ContextMenu.css";

const ContextMenu = () => {
  const { anchorPoint, show } = useContextMenu();

  if (show) {
    return (
      <ul className="menu" style={{ top: anchorPoint.y, left: anchorPoint.x }}>
        <li className="menu_item">Share</li>
        <li className="menu_item">Cut</li>
        <li className="menu_item">Copy to</li>
        <li className="menu_item">Download</li>
        <hr />
        <li className="menu_item">Refresh</li>
        <li className="menu_item">Delete</li>
      </ul>
    );
  }
  return null;
};

export default ContextMenu;
