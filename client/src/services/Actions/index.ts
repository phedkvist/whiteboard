import { Element, ElementType } from "../../types";
import { Change } from "../ChangeTypes";
import { deleteDiamondAction } from "./Diamond";
import { deleteEllipseAction } from "./Ellipse";
import { deletePolylineAction } from "./Polyline";
import { deleteRectAction } from "./Rect";
import { deleteTextAction } from "./Text";

export const createDeleteChange = (
  element: Element,
  userId: string
): Change | null => {
  if (!element) {
    // In the event that a selected element has been deleted already.
    return null;
  }
  if (element.type === ElementType.Rect) {
    return deleteRectAction(element, userId);
  } else if (element.type === ElementType.Ellipse) {
    return deleteEllipseAction(element, userId);
  } else if (element.type === ElementType.Polyline) {
    return deletePolylineAction(element, userId);
  } else if (element.type === ElementType.Diamond) {
    return deleteDiamondAction(element, userId);
  } else {
    return deleteTextAction(element, userId);
  }
};
