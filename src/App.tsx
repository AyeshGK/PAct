import { PAct , useState} from "./PAct.js";

export const App = () => {
  // const myName = 'Arindam';

  const [name, setName] = useState('Arindam');
  const [count, setCount] = useState(0);

  const handleSetName = (e) => {
    debugger;
    setName(e.target.value);
  }

  const handlePlusCount = () => {
    debugger;
    setCount(count + 1);
  }

  return (
    <div draggable>
      <h2>Hello {name}!</h2>
      <p>I am a pargraph</p>
      <input
        type="text"
        value={name}
        onchange={(e) => handleSetName(e)}
      />
      <h2> Counter value: {count}</h2>
      <button onclick={() => handlePlusCount()}>+1</button>
      <button onclick={() => setCount(count - 1)}>-1</button>
    </div>
  );
};