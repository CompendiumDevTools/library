import type { NodeID, NodeOptions } from "./nodes";
import nodes from "./nodes";

export default function unregisterNode(id: NodeID) {
	console.log(`Unregistering node with ID "${id}".`);
	delete nodes[id];
	window.postMessage(
		{
			id,
			type: "UNREGISTER_NODE",
			source: "compendium-devtools-extension",
		},
		"*"
	);
}
