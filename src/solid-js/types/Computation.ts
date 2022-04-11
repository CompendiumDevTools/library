import Owner from "./Owner";

type Computation = Owner["owned"][number] & {
	comparator?: (a: any, b: any) => boolean;
};
export default Computation;
