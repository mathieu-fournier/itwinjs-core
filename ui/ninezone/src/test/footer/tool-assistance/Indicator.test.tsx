/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { mount, shallow } from "enzyme";
import * as React from "react";

import { ToolAssistance } from "../../../ui-ninezone";

describe("<ToolAssistance />", () => {
  it("should render", () => {
    mount(<ToolAssistance />);
  });

  it("renders correctly", () => {
    shallow(<ToolAssistance />).should.matchSnapshot();
  });

  it("renders correctly with label", () => {
    shallow(<ToolAssistance>Start Point</ToolAssistance>).should.matchSnapshot();
  });
});
