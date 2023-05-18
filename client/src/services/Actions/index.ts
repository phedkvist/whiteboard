import { Element, ElementType } from "../../types";
import {
  DeleteEllipseAction,
  DeletePolylineAction,
  DeleteRectAction,
  DeleteTextAction,
} from "../ChangeTypes";
import { deleteEllipseAction } from "./Ellipse";
import { deletePolylineAction } from "./Polyline";
import { deleteRectAction } from "./Rect";
import { deleteTextAction } from "./Text";

export const createDeleteChange = (
  element: Element,
  userId: string
):
  | DeleteRectAction
  | DeleteEllipseAction
  | DeletePolylineAction
  | DeleteTextAction => {
  if (element.type === ElementType.Rect) {
    return deleteRectAction(element, userId);
  } else if (element.type === ElementType.Ellipse) {
    return deleteEllipseAction(element, userId);
  } else if (element.type === ElementType.Polyline) {
    return deletePolylineAction(element, userId);
  } else {
    return deleteTextAction(element, userId);
  }
};
