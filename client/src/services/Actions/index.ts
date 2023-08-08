import { Element, ElementType } from "../../types";
import { Change } from "../ChangeTypes";
import { deleteDiamondAction, updateDiamondAction } from "./Diamond";
import { deleteEllipseAction, updateEllipseAction } from "./Ellipse";
import { deletePolylineAction, updatePolylineAction } from "./Polyline";
import { deleteRectAction, updateRectAction } from "./Rect";
import { deleteTextAction, updateTextAction } from "./Text";

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

export const createUpdateChange = (
  element: Element,
  ephemeral: boolean,
  userId: string
): Change | null => {
  if (!element) {
    // In the event that a selected element has been deleted already.
    return null;
  }
  if (element.type === ElementType.Rect) {
    return updateRectAction(element, ephemeral, userId);
  } else if (element.type === ElementType.Ellipse) {
    return updateEllipseAction(element, ephemeral, userId);
  } else if (element.type === ElementType.Polyline) {
    return updatePolylineAction(element, ephemeral, userId);
  } else if (element.type === ElementType.Diamond) {
    return updateDiamondAction(element, ephemeral, userId);
  } else {
    return updateTextAction(element, ephemeral, userId);
  }
};
