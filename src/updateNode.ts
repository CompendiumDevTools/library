import stores, { NodeID, NodeOptions, NodePoint } from "./nodes";
import serialize from "./utils/serialize";

export default function updateNode(id: NodeID, nodeData: Partial<NodePoint>) {
	const safeNodeData = {
		...nodeData,
	};
	const storedNode = stores[id];

	if (!storedNode) {
		console.warn(`Node with ID "${id}" not found.`);
		return;
	}

	if (storedNode.serialize) {
		safeNodeData.state = serialize(
			nodeData.state,
			typeof storedNode.serialize === "function"
				? storedNode.serialize
				: undefined
		);
	}

	console.log(`Updating node with ID "${id}".`, safeNodeData);

	window.postMessage(
		Object.assign(safeNodeData, {
			id,
			type: "UPDATE_NODE",
			source: "compendium-devtools-extension",
		}),
		"*"
	);
}
