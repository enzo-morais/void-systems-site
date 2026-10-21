// <ViewTransition> vem do React usado pelo Next (embutido no Next 16.4, sem configuração) e ainda não está em @types/react.
import "react";

declare module "react" {
  interface ViewTransitionProps {
    children?: React.ReactNode;
    name?: string;
    default?: string;
    enter?: string | Record<string, string>;
    exit?: string | Record<string, string>;
    update?: string | Record<string, string>;
    share?: string | Record<string, string>;
  }
  export const ViewTransition: React.ComponentType<ViewTransitionProps>;
}
