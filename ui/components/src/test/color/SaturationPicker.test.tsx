/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { expect } from "chai";
import sinon from "sinon";
import { SaturationPicker } from "../../ui-components/color/SaturationPicker";
import { HSVColor } from "@bentley/imodeljs-common";

describe("<SaturationPicker />", () => {
  const hsv = new HSVColor();
  hsv.h = 30;
  hsv.s = 30;
  hsv.v = 30;

  const satDivStyle: React.CSSProperties = {
    top: `0`,
    left: `0`,
    width: `200px`,
    height: `200px`,
    position: `absolute`,
  };

  const createBubbledEvent = (type: string, props = {}) => {
    const event = new Event(type, { bubbles: true });
    Object.assign(event, props);
    return event;
  };

  afterEach(cleanup);

  it("picker should render", () => {
    const renderedComponent = render(<div style={satDivStyle}><SaturationPicker hsv={hsv} /></div>);
    expect(renderedComponent).not.to.be.undefined;
  });

  it("Use keyboard to change saturation", async () => {
    let index = 0;

    // starting value is 30
    const keys = ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp", "Home", "End", "PageDown", "PageUp"];
    const satValues = [29, 30, 31, 30, 0, 100, 30, 30, 20, 30, 40, 30, 0, 100, 30, 30];
    const vValues = [30, 29, 30, 31, 30, 30, 0, 100, 30, 20, 30, 40, 30, 30, 0, 100];

    const spyOnPick = sinon.spy();

    function handleSaturationChange(newHsv: HSVColor): void {
      expect(newHsv.s).to.be.equal(satValues[index]);
      expect(newHsv.v).to.be.equal(vValues[index]);
      spyOnPick();
    }

    const renderedComponent = render(<div style={satDivStyle}><SaturationPicker hsv={hsv} onSaturationChange={handleSaturationChange} /></div>);
    const sliderDiv = renderedComponent.getByTestId("saturation-region");
    expect(sliderDiv).not.to.be.null;
    expect(sliderDiv.tagName).to.be.equal("DIV");

    keys.forEach((keyName) => {
      fireEvent.keyDown(sliderDiv, { key: keyName });
      expect(spyOnPick.calledOnce).to.be.true;
      spyOnPick.resetHistory();
      index = index + 1;
    });

    keys.forEach((keyName) => {
      fireEvent.keyDown(sliderDiv, { key: keyName, ctrlKey: true });
      expect(spyOnPick.calledOnce).to.be.true;
      spyOnPick.resetHistory();
      index = index + 1;
    });
  });

  describe("using mouse location", () => {
    const getBoundingClientRect = Element.prototype.getBoundingClientRect;

    // force getBoundingClientRect to return info we need during testing
    before(() => {
      Element.prototype.getBoundingClientRect = () => ({
        bottom: 0,
        height: 200,
        left: 0,
        right: 0,
        toJSON: () => { },
        top: 0,
        width: 200,
        x: 0,
        y: 0,
      });
    });

    after(() => {
      Element.prototype.getBoundingClientRect = getBoundingClientRect;
    });

    it("point @0,0", () => {
      function handleSaturationChange(newHsv: HSVColor): void {
        expect(newHsv.s).to.be.equal(0);
        expect(newHsv.v).to.be.equal(100);
      }

      const renderedComponent = render(<div style={satDivStyle}><SaturationPicker hsv={hsv} onSaturationChange={handleSaturationChange} /></div>);
      const sliderDiv = renderedComponent.getByTestId("saturation-region");
      sliderDiv.dispatchEvent(createBubbledEvent("mousedown", { pageX: 0, pageY: 0 }));
      sliderDiv.dispatchEvent(createBubbledEvent("mouseup", { pageX: 0, pageY: 0 }));
    });

    it("point @200,200", () => {
      function handleSaturationChange(newHsv: HSVColor): void {
        expect(newHsv.s).to.be.equal(100);
        expect(newHsv.v).to.be.equal(0);
      }

      const renderedComponent = render(<div style={satDivStyle}><SaturationPicker hsv={hsv} onSaturationChange={handleSaturationChange} /></div>);
      const sliderDiv = renderedComponent.getByTestId("saturation-region");
      sliderDiv.dispatchEvent(createBubbledEvent("mousedown", { pageX: 200, pageY: 200 }));
      sliderDiv.dispatchEvent(createBubbledEvent("mouseup", { pageX: 200, pageY: 200 }));
    });

  });

  describe("using touch location", () => {
    const getBoundingClientRect = Element.prototype.getBoundingClientRect;

    // force getBoundingClientRect to return info we need during testing
    before(() => {
      Element.prototype.getBoundingClientRect = () => ({
        bottom: 0,
        height: 200,
        left: 0,
        right: 0,
        toJSON: () => { },
        top: 0,
        width: 200,
        x: 0,
        y: 0,
      });
    });

    after(() => {
      Element.prototype.getBoundingClientRect = getBoundingClientRect;
    });

    it("point @0,0", () => {
      function handleSaturationChange(newHsv: HSVColor): void {
        expect(newHsv.s).to.be.equal(0);
        expect(newHsv.v).to.be.equal(100);
      }

      const renderedComponent = render(<div style={satDivStyle}><SaturationPicker hsv={hsv} onSaturationChange={handleSaturationChange} /></div>);
      const sliderDiv = renderedComponent.getByTestId("saturation-region");
      sliderDiv.dispatchEvent(createBubbledEvent("touchstart", { touches: [{ pageX: 0, pageY: 0 }] }));
      sliderDiv.dispatchEvent(createBubbledEvent("touchend", { touches: [{ pageX: 0, pageY: 0 }] }));
    });

    it("point @200,200", () => {
      function handleSaturationChange(newHsv: HSVColor): void {
        expect(newHsv.s).to.be.equal(100);
        expect(newHsv.v).to.be.equal(0);
      }

      const renderedComponent = render(<div style={satDivStyle}><SaturationPicker hsv={hsv} onSaturationChange={handleSaturationChange} /></div>);
      const sliderDiv = renderedComponent.getByTestId("saturation-region");
      sliderDiv.dispatchEvent(createBubbledEvent("touchstart", { touches: [{ pageX: 200, pageY: 200 }] }));
      sliderDiv.dispatchEvent(createBubbledEvent("touchend", { touches: [{ pageX: 200, pageY: 200 }] }));
    });

  });

});
