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
 * Re-renders the root component into the root node.
 *
 * Clears the current content of the root node and resets the application
 * state cursor. Then, it calls `interRender` to render the root component
 * again. This function is typically called when the state changes to update
 * the UI.
 */
// export const reRender = () => {
//   if (rootComponent && rootNode) {
//     rootNode.innerHTML = ''; // Clear the root node
//     appStateCursor = 0;
//     interRender(rootComponent(), rootNode); // Re-render the component
//   }
// };

/// rerender 2 
export const reRender = (): void => {
  if (rootComponent && rootNode) {
    // Reset the state cursor before re-rendering
    appStateCursor = 0;

    // Create a new virtual DOM tree
    const newHTML = document.createElement('div');
    newHTML.id = 'myapp';

    // Render the component into the new virtual DOM tree
    interRender(rootComponent(), newHTML);

    // Compute the differences between the new and old DOM
    const changes = diff(newHTML, rootNode);

    // Apply the changes to the actual DOM
    apply(changes, rootNode);

    rootNode.innerHTML = "";
    rootNode.appendChild(newHTML.firstChild);
  }
};

///// ------ state management ---------
let state: Array<any> = [];
let subscribers: Array<() => void> = [];
let appStateCursor = 0;
export const useState = (initialState) => {
  const stateCursor = appStateCursor;
  state[stateCursor] = state[stateCursor] || initialState;

  console.log(`useState is initialized at cursor ${stateCursor} with value:`,state);

  const setState = (newState) => {
    console.log("state")
    state[stateCursor] = newState;

    subscribers.forEach((subscriber) => subscriber()); 
  };
  
  appStateCursor++;
  console.log(`stateDump`, state);
  return [state[stateCursor], setState];
};

//// ----------- diff ---------

// const diff = (oldEl: VElement | string | number, newEl: VElement | string | number, actualNode: HTMLElement): void => {
//   // Case 1: Different Types
//   if (typeof oldEl !== typeof newEl || (typeof oldEl === 'object' && oldEl.tag !== newEl.tag)) {
//     console.log('Different Types');
//     actualNode.innerHTML = ''; // Tear down the old subtree
//     interRender(newEl, actualNode); // Re-render the new subtree
//     return;
//   }

//   // Case 2: Same Elements (update props and children)
//   if (typeof oldEl === 'object' && typeof newEl === 'object' && oldEl.tag === newEl.tag) {
//     console.log('Same Elements');
//     updateElement(oldEl, newEl, actualNode);
//     return;
//   }

//   // Case 3: Component Update
//   if (typeof oldEl === 'function' && typeof newEl === 'function') {
//     console.log('Component Update');
//     updateComponent(oldEl, newEl, actualNode);
//     return;
//   }

//   // Case 4: Children (recursively diff and update)
//   if (typeof oldEl === 'object' && typeof newEl === 'object' && oldEl.children && newEl.children) {
//     console.log('Children');
//     updateChildren(oldEl.children, newEl.children, actualNode);
//     return;
//   }
// };


// const updateElement = (oldEl: VElement, newEl: VElement, actualNode: HTMLElement): void => {
//   const domEl = actualNode.firstChild as HTMLElement;

//   // Update props
//   const oldProps = oldEl.props || {};
//   const newProps = newEl.props || {};

//   // Remove old props that are not in new props
//   Object.keys(oldProps).forEach((prop) => {
//     if (!(prop in newProps)) {
//       domEl.removeAttribute(prop);
//     }
//   });

//   // Add or update new props
//   Object.keys(newProps).forEach((prop) => {
//     if (oldProps[prop] !== newProps[prop]) {
//       domEl[prop] = newProps[prop];
//     }
//   });

//   // Recursively diff children
//   if (oldEl.children && newEl.children) {
//     // updateChildren(oldEl.children, newEl.children, domEl);
//     array.forEach(element => {
      
//     });
//   }
// };

// const updateComponent = (oldEl: Function, newEl: Function, actualNode: HTMLElement): void => {
//   const oldProps = oldEl.props || {};
//   const newProps = newEl.props || {};

//   if (oldProps !== newProps) {
//     actualNode.innerHTML = ''; // Clear the actualNode
//     interRender(newEl(newProps), actualNode); // Re-render the component with new props
//   }
// };

// const updateChildren = (oldChildren: Array<VElement | string | number>, newChildren: Array<VElement | string | number>, actualNode: HTMLElement): void => {
//   const maxLength = Math.max(oldChildren.length, newChildren.length);

//   for (let i = 0; i < maxLength; i++) {
//     const oldChild = oldChildren[i];
//     const newChild = newChildren[i];

//     if (oldChild && newChild) {
//       diff(oldChild, newChild, actualNode);
//     } else if (newChild) {
//       // New child added
//       interRender(newChild, actualNode);
//     } else if (oldChild) {
//       // Old child removed
//       actualNode.removeChild(actualNode.childNodes[i]);
//     }
//   }
// };