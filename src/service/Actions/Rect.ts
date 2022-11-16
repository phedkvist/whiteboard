import { ElementState, ElementType, Rect } from "../../Types";
import { ChangeType, CreateRectAction } from "../ChangeTypes";

export const createRectAction = (
  initialX: number,
  initialY: number,
  renderingOrder: number,
  id: string,
): CreateRectAction => {

  const rect: Rect = {
    id,
    type: ElementType.Rect,
    width: 0,
    height: 0,
    x: initialX,
    y: initialY,
    state: ElementState.Creation,
    rotate: 0,
    renderingOrder,
  };
  // DISPATCH THIS AS A CHANGE EVENT INSTEAD.
  // newAppState.elements[id] = newRect;
  //setAppState({ ...newAppState, elementsCount, renderingOrder });
  console.log("HELLO", rect);
  return {
    elementType: ElementType.Rect,
    object: rect,
    changeType: ChangeType.Create,
    userVersion: {
      userId: "test",
      clock: 1,
    },
    ephemeral: false,
  };
};

export {};
