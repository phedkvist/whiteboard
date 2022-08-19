import useContextMenu from "../../hooks/useContextMenu";
import "./ContextMenu.css";

const ContextMenu = () => {
  const { anchorPoint, show } = useContextMenu();

  if (show) {
    return (
      <ul className="menu" style={{ top: anchorPoint.y, left: anchorPoint.x }}>
        <li className="menu_item">Copy</li>
        <li className="menu_item">Bring to top</li>
        <li className="menu_item">Bring to bottom</li>
        <hr />
        <li className="menu_item">Delete</li>
      </ul>
    );
  }
  return null;
};

export default ContextMenu;
