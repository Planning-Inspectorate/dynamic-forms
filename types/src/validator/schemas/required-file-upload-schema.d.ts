export default schema;
declare function schema(
	path: any,
	journeyResponse: any,
	documentType: any,
	errorMsg?: string
): {
	[x: number]: {
		custom: {
			options: (
				value: any,
				{
					req
				}: {
					req: any;
				}
			) => Promise<boolean>;
		};
	};
};
