import { mock, resetAll, verifyAll, when } from "strong-mock";
import { ArrowSelection, ArrowSelectionProps, Side } from "./ArrowSelection";
import { fireEvent, render } from "@testing-library/react";
import { ArrowOption } from "../../types";

describe("ArrowSelection", () => {
  afterEach(() => {
    verifyAll();
    resetAll();
  });

  const onSelectArrowOptionMock =
    mock<ArrowSelectionProps["onSelectArrowOption"]>();

  it("should render two arrow edit buttons", () => {
    const screen = render(
      <ArrowSelection onSelectArrowOption={onSelectArrowOptionMock} />
    );
    expect(screen.getByTestId("left-arrow-btn")).toBeDefined();
    expect(screen.getByTestId("right-arrow-btn")).toBeDefined();
  });

  it("should render dropdown when click on arrow button", () => {
    const screen = render(
      <ArrowSelection onSelectArrowOption={onSelectArrowOptionMock} />
    );
    fireEvent.click(screen.getByTestId("left-arrow-btn"));
    expect(screen.getByTestId("arrow-none")).toBeDefined();
    expect(screen.getByTestId("arrow-slim")).toBeDefined();
    expect(screen.getByTestId("arrow-thick")).toBeDefined();
  });

  it("should select a arrow style when clicking on one arrow option", () => {
    when(() =>
      onSelectArrowOptionMock(Side.left, ArrowOption.thick)
    ).thenReturn();

    const screen = render(
      <ArrowSelection onSelectArrowOption={onSelectArrowOptionMock} />
    );

    fireEvent.click(screen.getByTestId("left-arrow-btn"));
    fireEvent.click(screen.getByTestId("arrow-thick"));
  });
});
