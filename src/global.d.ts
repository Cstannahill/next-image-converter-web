declare global {
  interface RequestInit {
    duplex?: "half" | "full";
  }
  declare module "*.css";
}

export {};
