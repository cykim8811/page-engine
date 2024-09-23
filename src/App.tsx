import Page from "./components/Page";
import { PageConfig } from "./config";

const config: PageConfig = {
  gridSize: {
    width: 32,
    height: 32,
  },
};

function App() {
  return (
    <div className="w-screen h-screen">
      <Page config={config} />
    </div>
  );
}

export default App;
