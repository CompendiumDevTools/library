import type { NodeID, NodePoint, NodeOptions } from "./nodes";
import nodes from "./nodes";
import serialize from "./utils/serialize";

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
	T,
	Exclude<keyof T, Keys>
> &
	{
		[K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
	}[Keys];

export default function registerNode(
	nodeData: RequireAtLeastOne<NodePoint> & Partial<NodeOptions>
): NodeID {
	// Don't check for duplicate IDs. That's handled by the extension.
	// If there is an identical ID it should be overwritten.
	// This is to smoothly handle HMR.
	const safeNodeData = {
		...nodeData,
		id: nodeData.id ?? crypto.randomUUID(),
		serialize: nodeData.serialize ?? true,
		trackHistory: nodeData.trackHistory ?? true,
	};

	console.log(`Registering node with ID "${safeNodeData.id}".`, safeNodeData);

	// Save only the options.
	nodes[safeNodeData.id] = {
		id: safeNodeData.id,
		serialize: safeNodeData.serialize,
		trackHistory: safeNodeData.trackHistory,
	};

	safeNodeData.state = serialize(safeNodeData.state);

	window.postMessage(
		Object.assign(safeNodeData, {
			type: "REGISTER_NODE",
			source: "compendium-devtools-extension",
		}),
		"*"
	);
	return safeNodeData.id;
}
