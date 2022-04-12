import stores, { NodeID, NodeOptions, NodePoint } from "./nodes";
import serialize from "./utils/serialize";

export default function updateNode(id: NodeID, point: Partial<NodePoint>) {
	const safePoint = {
		...point,
	};
	const storedNode = stores[id];

	if (!storedNode) {
		console.warn(`Node with ID "${id}" not found.`);
		return;
	}

	if (storedNode.serialize) {
		safePoint.state = serialize(
			point.state,
			typeof storedNode.serialize === "function"
				? storedNode.serialize
				: undefined
		);
	}

	console.log(`Updating node with ID "${id}".`, safePoint);

	window.postMessage(
		Object.assign(safePoint, {
			id,
			type: "UPDATE_NODE",
			source: "compendium-devtools-extension",
		}),
		"*"
	);
}
