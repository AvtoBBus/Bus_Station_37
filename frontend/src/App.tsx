import { Panel } from "$widgets/Panel";
import { useState } from "react";
import "./App.scss";

export function App() {

  const [valueLeft, dispatchUpdateLeft] = useState(0);
  const [valueRight, dispatchUpdateRight] = useState(0);

  return (
    <>
      <div className="main-container">
        <Panel 
          updateTrigger={valueLeft} 
          panelClass="left-panel"
          isSelectedItems={false}
          onUpdateList={() => dispatchUpdateRight(x => x + 1)}
        />
        <Panel 
          updateTrigger={valueRight} 
          panelClass="right-panel"
          isSelectedItems={true}
          onUpdateList={() => dispatchUpdateLeft(x => x + 1)}
        />
      </div>
    </>
  )
};