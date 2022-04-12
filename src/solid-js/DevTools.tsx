import { Component, getOwner } from "solid-js";
import type Computation from "./types/Computation";
import { registerNode, unregisterNode, updateNode } from "../index";
import { NodeID } from "../nodes";

const DevTools: Component<{ enabled?: boolean }> = (props) => {
	const root = getOwner() as Computation;

	console.log("Solid Root", root);

	watchNode(root);

	return props.children;
};

// This function drills deeper into the root object and watches all the nodes in it.
function watchNode(root: Computation) {
	// Go through existing nodes.
	if (Array.isArray(root.owned)) {
		for (let i = 0; i < root.owned.length; i++) {
			watchNode(root.owned[i]);
		}
	}

	// Make sure node.owned is always watched by reapplying the proxy on set.
	let owned = root.owned;
	Object.defineProperty(root, "owned", {
		get: () => owned,
		set: (newOwned) => {
			// TODO: Look at a slightly simpler way of doing this. It works right now so I'm not changing it.

			// Go through existing nodes.
			if (Array.isArray(newOwned)) {
				for (let i = 0; i < newOwned.length; i++) {
					watchNode(newOwned[i]);
				}
			}

			// Watch for changes in the owned array.
			owned = new Proxy(newOwned ?? [], {
				set(target, key, value, receiver) {
					if (key !== "length") {
						// When new nodes are added, watch them.
						watchNode(value);
					}

					return Reflect.set(target, key, value, receiver);
				},
				deleteProperty(target, key) {
					// When nodes are removed, unwatch them.
					unwatchValue(target[key]);

					return Reflect.deleteProperty(target, key);
				},
			});
		},
	});

	// Watch for changes to the sourceMap.
	// This is an object where the keys are the names of signals and the values are the signal's data.
	root.sourceMap = new Proxy(root.sourceMap ?? {}, {
		set(target, key, value, receiver) {
			// When a new signal is added, watch the value on it.
			watchValue(value, "signal");

			return Reflect.set(target, key, value, receiver);
		},
		deleteProperty(target, key) {
			// When signals are removed, unwatch them.
			unwatchValue(target[key as string] as Computation);

			return Reflect.deleteProperty(target, key);
		},
	});

	// Watch the value of the node.
	// This could be meany things including DOM elements and uncalled signal readers.
	watchValue(root, "node");
}

const idSymbol = Symbol("id");
function watchValue(node: Computation, type: "signal" | "node") {
	let value = node.value;

	// Register the node/signal.
	let id;
	let name;

	// Watch the value with a light getter. There's no need to use a proxy.
	Object.defineProperty(node, "value", {
		get: () => value,
		set: (newValue) => {
			if (id === undefined) {
				name =
					type === "signal"
						? `signal(${node.name})`
						: node.componentName != null
						? {
								open: `<${node.componentName}>`,
								close: `</${node.componentName}>`,
						  }
						: { open: `<${node.name}>`, close: `</${node.name}>` };
				id = registerNode({ name, state: value });
				node[idSymbol] = id;
			}

			// Use the available differ if there is one.
			// It could exist but might be undefined, so check if it's a function.
			if (
				typeof node.comparator === "function"
					? !node.comparator(value, newValue)
					: value !== newValue
			) {
				value = newValue;

				// Once, if the value has changed, update the value in the registry.
				// A setTimeout is needed because I forgot why just trust me it's needed.
				setTimeout(
					() =>
						updateNode(id, {
							name,
							state: value,
						}),
					0
				);
			}
		},
	});

	// If it's a signal, wait until the name exists.
	if (type === "signal") {
		let name = node.name;
		Object.defineProperty(node, "name", {
			get: () => name,
			set: (newName) => {
				name = newName;
				// Trigger the setter to register the node.
				node.value = node.value;
				return newName;
			},
		});
	}
}

function unwatchValue(node: Computation) {
	// Unregister the node/signal.
	unregisterNode(node[idSymbol]);
}

export default DevTools;
