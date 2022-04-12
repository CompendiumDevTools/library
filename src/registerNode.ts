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
	point: RequireAtLeastOne<NodePoint>,
	options: Partial<NodeOptions> = {}
): NodeID {
	// Don't check for duplicate IDs. That's handled by the extension.
	// If there is an identical ID it should be overwritten.
	// This is to smoothly handle HMR.
	const safePoint = {
		...point,
	};
	const safeOptions = {
		...options,
		id: options.id ?? crypto.randomUUID(),
		serialize: options.serialize ?? true,
		trackHistory: options.trackHistory ?? true,
		actions: options.actions ?? [],
	};

	console.log(`Registering node with ID "${safeOptions.id}".`, safeOptions);

	// Save only the options.
	nodes[safeOptions.id] = {
		id: safeOptions.id,
		serialize: safeOptions.serialize,
		trackHistory: safeOptions.trackHistory,
		actions: safeOptions.actions,
	};

	safePoint.state = serialize(safePoint.state);

	window.postMessage(
		{
			type: "REGISTER_NODE",
			source: "compendium-devtools-extension",
			options: safeOptions,
			point: safePoint,
		},
		"*"
	);
	return safeOptions.id;
}
