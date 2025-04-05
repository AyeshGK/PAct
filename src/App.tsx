import { PAct, useState, useEffect } from "@/PAct";

export const App = () => {
  const [name, setName] = useState<string>('Your World!');
  const [countA, setCountA] = useState<number>(0);
  // const [countB, setCountB] = useState<number>(0);
  // const [countC, setCountC] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  const log = (msg: string) => {
    setLogs([...logs.value, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Logs to show lifecycle & render flow
  useEffect(() => {
    console.log("🌀 Component re-rendered");
  });

  useEffect(() => {
    log("✅ Component mounted");
    console.log("✅ Component mounted");
    return () => log("❌ Component unmounted");
  }, []);

  useEffect(() => {
    log(`🔁 countA changed to ${countA.value}`);
    console.log(`🔁 countA changed to ${countA.value}`);
  }, [countA.value]);

  // useEffect(() => {
  //   log(`🔁 countB changed to ${countB.value}`);
  // }, [countB.value]);

  // useEffect(() => {
  //   log(`🔁 countC changed to ${countC.value}`);
  // }, [countC.value]);

  const total = countA.value ;
  console.log("logs :", logs.value);

  return (
    <div>
<section className="pact-logo">
  

  <img
    src="src/pact-name-icon.png"
    alt="PAct"
  />
</section>
          <div className="app-container">
             {/* <img
    src="../logo."
    className="rotating-image"
    alt="Earth"
  /> */}
      <div className="header-container">
      <img src="/src/logo.svg" alt="Logo" className="rotating-icon" />
      <span className="header-title">PAct Library Demo</span>
    </div>
      

      <section>
        <h2>Hello, <strong>{name.value}</strong> 👋</h2>
        <input
          type="text"
          value={name.value}
          onchange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h3>🧮 Counters</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {/* {[
            { label: "Count A", value: countA.value, setter: setCountA },
            { label: "Count B", value: countB.value, setter: setCountB },
            { label: "Count C", value: countC.value, setter: setCountC },
          ].map((item, idx) => (
            <div key={idx} className="counter-box">
              <h4>{item.label}</h4>
              <p style={{ fontSize: "1.5rem" }}>{item.value}</p>
              <button onclick={() => item.setter(item.value + 1)}>+1</button>
              <button onclick={() => item.setter(item.value - 1)}>-1</button>
            </div>
          ))} */}
          <div className="counter-box">
              <h4>Count A</h4>
              <p style={{ fontSize: "1.5rem" }}>{countA.value}</p>
              <button onclick={() => setCountA(countA.value + 1)}>+1</button>
              <button onclick={() => setCountA(countA.value - 1)}>-1</button>
            </div>
        </div>
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
          🔢 Total: {total}
        </p>
      </section>

      <section>
        <h3>📋 Effect Log</h3>
        <div className="effect-log">
          {logs.value?.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </section>
    </div>
    </div>
  );
};
