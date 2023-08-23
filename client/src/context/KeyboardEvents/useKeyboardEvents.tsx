import { useLayoutEffect, useState } from "react";
import { copy } from "../../helpers/utility";
import { createUpdateChange, createDeleteChange } from "../../services/Actions";
import {
  SelectionModeHelper,
  Polyline,
  ElementState,
  SelectionModes,
  ElementType,
} from "../../types";
import { getViewBoxAfterZoom } from "../MouseEvents/helpers";
import { useAppState } from "../AppState";
import * as KeyCode from "keycode-js";

export const useKeyboardEvents = () => {
  const {
    appState,
    history,
    selectedElements,
    setSelectedElements,
    selectionCoordinates,
    setSelectionCoordinates,
    selectionMode,
    setSelectionMode,
    viewBox,
    setViewBox,
  } = useAppState();

  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isMetaPressed, setIsMetaPressed] = useState(false);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === KeyCode.CODE_ESCAPE) {
      if (SelectionModeHelper.isAddingPolyline(selectionMode)) {
        const selectedElement = selectedElements[0];
        const isEphemeral = false;
        if (!selectedElement || !history) return;

        const element = copy(appState.elements[selectedElement]) as Polyline;
        const shouldRemoveLastPoint =
          selectionCoordinates.nextPointIndex === element.points.length - 1;
        if (shouldRemoveLastPoint) {
          element.points = element.points.slice(0, -1);
        }
        element.state = ElementState.Visible;
        const changeAction = createUpdateChange(
          element,
          isEphemeral,
          history?.currentUserId
        );
        changeAction && history?.addLocalChange(changeAction);
        setSelectionMode({ ...selectionMode, type: SelectionModes.None });
      }

      setSelectionMode({ ...selectionMode, type: SelectionModes.None });
      setSelectedElements([]);
      setSelectionCoordinates({
        ...selectionCoordinates,
        startX: null,
        startY: null,
        currentX: null,
        currentY: null,
        currentPointIndex: 0,
      });
      return;
    }
    if (e.code === KeyCode.CODE_SPACE) {
      setIsSpacePressed(true);
    }
    if (e.code === KeyCode.CODE_BACK_SPACE) {
      if (selectionMode.type === SelectionModes.TextEditing) return;
      const changes = selectedElements
        .map((id) => {
          const element = appState.elements[id];
          return createDeleteChange(element, history?.currentUserId!);
        })
        .filter((c) => c !== null);
      changes.forEach((c) => history?.addLocalChange(c!));
      setSelectedElements([]);
    }

    if (e.code === KeyCode.CODE_META_LEFT) {
      setIsMetaPressed(true);
    }

    // CHECK IF SHORT COMMANDS FOR CREATING A NEW ELEMENT IS PRESSED
    if (selectionMode.type !== SelectionModes.TextEditing) {
      let newElementType: ElementType | undefined;
      if (e.code === KeyCode.CODE_R) {
        newElementType = ElementType.Rect;
      } else if (e.code === KeyCode.CODE_D) {
        newElementType = ElementType.Diamond;
      } else if (e.code === KeyCode.CODE_O) {
        newElementType = ElementType.Ellipse;
      } else if (e.code === KeyCode.CODE_T) {
        newElementType = ElementType.Text;
      } else if (e.code === KeyCode.CODE_L) {
        newElementType = ElementType.Polyline;
      }
      if (newElementType) {
        setSelectedElements([]);
        setSelectionMode({
          type: SelectionModes.Add,
          elementType: newElementType,
        });
      }
      if (e.code === KeyCode.CODE_V) {
        setSelectedElements([]);
        setSelectionMode({
          type: SelectionModes.Selected,
          elementType: undefined,
        });
      }
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === KeyCode.CODE_SPACE) {
      setIsSpacePressed(false);
    }
    if (e.code === KeyCode.CODE_META_LEFT) {
      setIsMetaPressed(false);
    }
  };

  const onWheel = (e: WheelEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }

    if (isMetaPressed) {
      const { offsetX, offsetY, deltaY } = e;
      const newViewBox = getViewBoxAfterZoom(viewBox, offsetX, offsetY, deltaY);
      if (newViewBox.w < 100 || newViewBox.h < 100) {
        return;
      } else if (newViewBox.w > 5000 || newViewBox.h > 5000) {
        return;
      }
      setViewBox({ ...viewBox, ...newViewBox });
    } else {
      setViewBox({
        ...viewBox,
        x: viewBox.x + e.deltaX,
        y: viewBox.y + e.deltaY,
      });
    }
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      setIsMetaPressed(false);
      setIsSpacePressed(false);
    }
  };

  useLayoutEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("visibilitychange", onVisibilityChange);
    };
  });

  return [isSpacePressed];
};
