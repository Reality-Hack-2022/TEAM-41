import React from "react";
import OuroTheme from "./theme";
import Providers from "./Providers";
import AppRouter from "./router";

function App() {
  return (
    <>
      <OuroTheme>
        <Providers>
          <AppRouter />
        </Providers>
      </OuroTheme>
    </>
  );
}

export default App;
