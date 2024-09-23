import Page from "./components/Page";
import { PageConfig } from "./config";

const config: PageConfig = {
  gridSize: {
    width: 24,
    height: 24,
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
