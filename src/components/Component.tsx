import SubComponent from "./SubComponent";

export interface ComponentProp {
  label: string;
}

function Component(prop: ComponentProp) {
  return (
    <>
      <h1>{prop.label}</h1>
      <SubComponent label="Carlinhos" number={323223} />
    </>
  );
}

export default Component;
