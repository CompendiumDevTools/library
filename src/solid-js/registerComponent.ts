import { onCleanup, onMount } from "solid-js";
import { DOMElement } from "solid-js/types/jsx";
import { v4 as uuid } from "uuid";
import { default as rc } from "../registerComponent";
import { default as urc } from "../unregisterComponent";
import type { StoreID } from "../stores";
import getStack from "../utils/getStack";
import { ComponentID } from "../components";

function assignID(
	element: string | DOMElement | (string | DOMElement)[],
	id: string
) {
	if (Array.isArray(element)) {
		for (let i = 0; i < element.length; i++) {
			const child = element[i];
			if (typeof child === "string") {
				element[i] = Object.assign(document.createElement("span"), {
					textContent: child,
				});
			}
			(element[i] as DOMElement).setAttribute("data-nests-component", id);
		}
	} else if (typeof element === "string") {
		element = Object.assign(document.createElement("span"), {
			textContent: element,
		});
		element.setAttribute("data-nests-component", id);
	} else if (typeof element === "function") {
		throw new Error(
			"Cannot track a component that is a fragment with a signal."
		);
	} else {
		element.setAttribute("data-nests-component", id);
	}
	return element;
}

export default function registerComponent(options: {
	name?: string;
	stores?: StoreID[];
	component: DOMElement | DOMElement[];
}): ComponentID {
	const id: ComponentID = uuid();

	const stack = getStack();
	// Make sure not to include this function.
	stack.shift();
	// Extract it from the stack.
	let componentName = "Component";
	for (let i = 0; i < stack.length; i++) {
		let name = stack[i].getFunctionName();
		if (name != null) {
			componentName = name;
			break;
		}
	}

	onMount(() => {
		const ret = assignID(options.component, id);
		// Loop up the DOM to find a parent with the data-nests-component attribute.
		let parent = Array.isArray(ret)
			? (ret[0] as DOMElement)
			: (ret as DOMElement);
		while (parent.parentElement) {
			parent = parent.parentElement;
			if (parent.hasAttribute("data-nests-component")) {
				break;
			}
		}
		if (parent === document.documentElement) parent = undefined;

		rc({
			name: options.name ?? componentName ?? "Component",
			id,
			parent: parent?.getAttribute("data-nests-component") ?? undefined,
			stores: [],
		});

		onCleanup(() => {
			urc({ id });
		});
	});

	return id;
}
