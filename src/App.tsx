import { PAct , useState, useEffect} from "@/PAct";


export const App = () => {
  const [name, setName] = useState<string>('Arindam');
  const [count, setCount] = useState<number>(0);

  // ✅ Run every time
  useEffect(() => {
    console.log('Application always run!.');
  });

  // ✅ Run once when the component mounts
  useEffect(() => {
    console.log("Component mounted!");
    return () => console.log("Component will unmount!"); // Cleanup function
  }, []);

  // ✅ Run every time `count` changes
  useEffect(() => {
    console.log(`Count changed: ${count.value}`);
  }, [count.value]);

  return (
    <div draggable>
      <h2>Hello {name.value}!</h2>
      <p>I am a paragraph</p>
      <input type="text" value={name.value} onchange={(e) => setName(e.target.value)} />
      <h2>Counter value: {count.value}</h2>
      <button onclick={() => setCount(count.value + 1)}>+1</button>
      <button onclick={() => setCount(count.value - 1)}>-1</button>
    </div>
  );
};