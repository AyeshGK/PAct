import { diff, apply } from "./Reconcile.js";

export const PAct = {
  /**
   * Creates a virtual DOM element with the given tag, props, and children.
   *
   * If `tag` is a function, it calls the function with `props` and `children` as
   * arguments and returns the result.
   *
   * If `tag` is not a function, it creates an object with `tag` as the tag name,
   * `props` as the properties, and `children` as the children. It then returns
   * the created object.
   *
   * @param tag - The tag name of the element to create. Can be a string, a
   *              function, or any other type of object.
   * @param props - The properties to set on the created element. Can be an object
   *               or null.
   * @param children - The children to create for the element. Can be any number
   *                  of arguments, which are spread into an array.
   * @returns The created virtual DOM element.
   */
    createElement: (tag, props, ...children) => {
      if (typeof tag === 'function') {
        return tag(props, ...children);
      }
      const el = {
        tag,
        props,
        children,
      };
      return el;
    },
  };

let rootComponent: () => any;
let rootNode: HTMLElement;

/**
 * Recursively renders a virtual DOM element into a container.
 *
 * @param el - The virtual DOM element to render. Can be a string, number,
 *             or an object representing an HTML element with props and children.
 * @param container - The DOM container to which the element will be appended.
 *
 * If `el` is a string or number, it creates a text node and appends it 
 * directly to the container. If `el` is an object, it creates an HTML element 
 * using the tag specified in `el.tag`, sets the properties as defined in 
 * `el.props`, and recursively renders any children specified in `el.children`.
 * Finally, it appends the created DOM element to the container.
 * 
 * 
 * `const App = (
    MLib.createElement('div',{draggable: true}, 
        MLib.createElement('h2',{}, 'Hello World'),
        MLib.createElement('p',{}, 'This is a paragraph'),
        MLib.createElement('input',{type :"text"})));
    
        render(App, document.getElementById('myapp'));`
 */        
interface Renderable {
  (): VElement | string | number;
}

/**
 * Renders a virtual DOM element into a container, and subscribes to the
 * re-render function. When the state changes, the component will be
 * re-rendered.
 *
 * @param el - The virtual DOM element to render. Can be a string, number,
 *             or an object representing an HTML element with props and children.
 * @param container - The DOM container to which the element will be appended.
 */
export const render = (el: Renderable, container: HTMLElement): void => {
  rootComponent = el;
  rootNode = container;
  interRender(el(), container);
  runEffects();

  subscribe(() => {
    reRender();
  });
}
  
/**
 * Subscribes a callback function to be invoked when the state changes.
 *
 * @param callback - A function to be called when the state is updated.
 *                   This function does not take any arguments and does not
 *                   return a value.
 */
export const subscribe = (callback: () => void) => {
  subscribers.push(callback);
};

/**
 * Recursively renders a virtual DOM element into a container.
 *
 * @param el - The virtual DOM element to render. Can be a string, number,
 *             or an object representing an HTML element with props and children.
 * @param container - The DOM container to which the element will be appended.
 * 
 * If `el` is a string or number, it creates a text node and appends it 
 * directly to the container. If `el` is an object, it creates an HTML element 
 * using the tag specified in `el.tag`, sets the properties as defined in 
 * `el.props`, and recursively renders any children specified in `el.children`.
 * Finally, it appends the created DOM element to the container.
 */
  interface VElement {
    tag: string;
    props?: { [key: string]: any };
    children?: Array<VElement | string | number>;
  }

/**
 * Recursively renders a virtual DOM element into a specified container.
 *
 * This function takes a virtual DOM element, which can be either a string,
 * number, or an object representation with a tag, properties, and children.
 * It converts the virtual element into a real DOM node and appends it to the
 * provided container. For string and number elements, it creates text nodes.
 * For object elements, it creates a DOM element based on the specified tag,
 * sets its properties, and recursively renders its children.
 *
 * @param el - The virtual DOM element to render. Can be a string, number,
 *             or an object with a tag, props, and children.
 * @param container - The DOM container to which the element will be appended.
 */
  export const interRender = (el: VElement | string | number, container: HTMLElement): void => {
    let domEl: HTMLElement | Text;
    if (typeof el === 'string' ) {
      domEl = document.createTextNode(el);
      container.appendChild(domEl);
      return;
    }
    if (typeof el === 'number') {
      domEl = document.createTextNode(el.toString());
      container.appendChild(domEl);
      return;
    }

    domEl = document.createElement(el.tag);
    let elProps = el.props ? Object.keys(el.props) : null;
    if (elProps && elProps.length > 0) {
      elProps.forEach((prop) => (domEl[prop] = el.props[prop]));
    }
    if (el.children && el.children.length > 0) {
      el.children.forEach((node) => interRender(node, domEl));
    }
    container.appendChild(domEl);
  };

/**
 * Re-renders the root component by computing and applying differences between
 * the current virtual DOM and the root DOM node.
 *
 * This function resets the application state cursor, creates a new virtual DOM
 * tree by rendering the root component, and calculates the differences between
 * this new virtual DOM and the existing DOM. It then applies these changes to
 * update the actual DOM, ensuring that only the necessary updates are performed.
 */
export const reRender = (): void => {
  if (rootComponent && rootNode) {
    // Reset the state cursor before re-rendering
    appStateCursor = 0;
    effectCursor = 0;

    // Create a new virtual DOM tree
    const newHTML = document.createElement('div');
    newHTML.id = 'myapp';

    // Render the component into the new virtual DOM tree
    interRender(rootComponent(), newHTML);

    debugger;
    // Compute the differences between the new and old DOM
    const changes = diff(newHTML, rootNode);

    // Apply the changes to the actual DOM
    apply(changes, rootNode);

    runEffects();
  }
};

/**
 * Creates a reactive state atom that can be used to store and retrieve state.
 * When the state is updated, all subscribers to the state will be notified.
 *
 * @param initialState - The initial state to store in the atom.
 * @return A tuple containing a reactive state proxy and a setter function.
 * The reactive state proxy can be used to get and set the state, and the setter
 * function can be used to update the state.
 */
interface StateObject<T> {
  value: T;
}
type SetState<T> = (newValue: T) => void;

let state: Array<any> = [];
let subscribers: Array<() => void> = [];
let appStateCursor = 0;
/**
 * Creates a reactive state atom that can be used to store and manage state within a component.
 *
 * The state is stored in an array, and each call to `useState` returns a proxy object along
 * with a setter function. The proxy object allows access to the current state value, while
 * the setter function allows updating the state. When the state is updated, all subscribers
 * to the state are notified, triggering re-renders.
 *
 * @template T - The type of the state value.
 * @param initialState - The initial state value to be stored.
 * @returns A tuple containing a reactive state proxy and a setter function. The proxy
 *          object provides access to the state value, and the setter function allows
 *          updating the state.
 */
export const useState = <T>(initialState: T): [StateObject<T>, SetState<T>] => {
  const stateCursor = appStateCursor;
  state[stateCursor] = state[stateCursor] ?? initialState;

  const proxyState: StateObject<T> = new Proxy(
    { value: state[stateCursor] },
    {
      get(target, prop) {
        if (prop === "value") return target.value;
      },
      set(target, prop, newValue) {
        if (prop === "value") {
          target.value = newValue;
          state[stateCursor] = newValue;
          subscribers.forEach((subscriber) => subscriber()); // Trigger re-renders
          return true;
        }
        return false;
      },
    }
  );

  appStateCursor++;

  return [proxyState, (newValue: T) => (proxyState.value = newValue)];
};


const shouldRunEffect = (prevDeps: any[], deps: any[]) => {
  // Run if no deps provided (just like React)
  if (deps === undefined) return true;

  // First render or previous deps are not valid
  if (!Array.isArray(prevDeps)) return true;

  // Compare each dep shallowly
  if (prevDeps.length !== deps.length) return true;

  return deps.some((dep, i) => dep !== prevDeps[i]);
};

let effects: Array<{ deps: any[]; effect: () => void | (() => void) | undefined; cleanup?: () => void; hasChanged: boolean }> = [];
let effectCursor = 0;

/**
 * Registers an effect to be run after each render. The effect may optionally
 * depend on some values, in which case it will only be run if one of the
 * dependencies has changed since the previous render.
 *
 * @param effect - The effect to run after each render. The effect
 *   may return a cleanup function, which will be run before the effect is
 *   applied again.
 * @param deps - An optional list of dependencies. If specified, the effect will
 *   only be run if one of the dependencies has changed since the previous render.
 */
export const useEffect = (effect: () => void | (() => void), deps?: any[]) => {
  const currentCursor = effectCursor;

  if (!effects[currentCursor]) {
    // First time running: Store the effect and dependencies
    effects[currentCursor] = { effect, deps, cleanup: undefined, hasChanged: true };
  } else {
    const prevDeps = effects[currentCursor].deps;
    
    // const hasChanged =
    // prevDeps === undefined || 
    // !Array.isArray(prevDeps) || 
    // (Array.isArray(prevDeps) && prevDeps.length > 0 && prevDeps.some((dep, i) => dep !== deps?.[i]));

    const hasChanged = shouldRunEffect(prevDeps, deps);

    if (hasChanged) {
      if (effects[currentCursor].cleanup) {
        effects[currentCursor].cleanup(); // Run cleanup function before applying new effect
      }
      effects[currentCursor].hasChanged = hasChanged;
      effects[currentCursor].effect = effect;
      effects[currentCursor].deps = deps;
    }
  }

  console.log("effects :", effects);

  effectCursor++;
};

/**
 * Runs all effects that have been registered with `useEffect` and resets their
 * state. This should be called after each render.
 *
 * @remarks
 * `runEffects` iterates over all effects that have been registered with
 * `useEffect` and checks if they need to be run based on their dependencies.
 * When an effect is run, its cleanup function is also stored so that it can
 * be run when the component is updated or unmounted.
 *
 * After all effects have been run, the effect cursor is reset to 0 so that
 * the next render can start registering new effects.
 */
export const runEffects = () => {
  effects.forEach((entry) => {
    if (entry.effect && entry.hasChanged) {
      entry.hasChanged = false;
      entry.cleanup = entry.effect() || undefined;
    }
  });

  effectCursor = 0;
};