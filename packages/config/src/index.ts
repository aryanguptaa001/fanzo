export const nodeEnvironment = ['development', 'test', 'production'] as const;
export type NodeEnvironment = (typeof nodeEnvironment)[number];
