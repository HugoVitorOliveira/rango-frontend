import { useState } from "react";
import "./App.css";
import Component from "./components/Component";
import { Button } from "@/components/ui/button";
import type { ItemListagemProps } from "./components/ItemListagem";
import Listagem from "./components/Listagem";
import { Field, FieldDescription, FieldLabel } from "./components/ui/field";
import { Input } from "./components/ui/input";
import FruitsFormComponent from "./components/FruitsFormComponent";

function App() {
  const [count, setCount] = useState(0);

  function bananilson() {
    alert("Bananilson Farofa");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <h1>Fuck react</h1>
      <div className="card">
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs" onClick={bananilson}>
        EU NÃO FODO COM INTELIGENCIAS ARTIFICIAS
      </p>

      <Component label="AAAAAAAAI MEU PAAFUUFEIUF" />
      <FruitsFormComponent />
    </div>
  );
}

export default App;
