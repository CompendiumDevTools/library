import Computation from "../types/Computation";

export default function walkRoot(root: Computation, callback: (node: any) => void) {
	// Create a stack and deep walk the object.
	const walked = new Set<object>();
	const stack = [root];

	while (stack.length > 0) {
		const node = stack.pop()!;

		if (walked.has(node)) {
			continue;
		}

		walked.add(node);

		console.log(node);

		if (typeof node === "object" && node.hasOwnProperty("owned") && node.owned != null) {
			stack.push(...node.owned);
		}

		callback(node);
	}
}
