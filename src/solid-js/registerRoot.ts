import { Component, onCleanup, onMount } from "solid-js";
import { DOMElement } from "solid-js/types/jsx";
import { v4 as uuid } from "uuid";
import { default as rc } from "../registerComponent";
import { default as urc } from "../unregisterComponent";
import type { StoreID } from "../stores";

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

export default function registerComponent<
	P extends object,
	C extends Component<P>
>(options: { name?: string; stores?: StoreID[]; component: C }): C {
	return function (props) {
		console.log("opts", options);

		const id = uuid();
		const ret = assignID(
			options.component(props) as DOMElement | DOMElement[],
			id
		);

		onMount(() => {
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
				name: options.name ?? options.component?.name ?? "Component",
				id,
				parent: parent?.getAttribute("data-nests-component") ?? undefined,
				stores: [],
			});

			onCleanup(() => {
				console.log("cleaning up", id);
				urc({
					id,
				});
			});

			console.log(ret, parent);
		});

		return ret;
	} as C;
}
