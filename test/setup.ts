import "@testing-library/jest-dom";

// JSDOM doesn't implement createObjectURL; provide a lightweight stub for tests.
if (typeof URL.createObjectURL === "undefined") {
  // @ts-ignore
  URL.createObjectURL = (v: any) => "blob:mock";
}
if (typeof URL.revokeObjectURL === "undefined") {
  // @ts-ignore
  URL.revokeObjectURL = (_: any) => {};
}
