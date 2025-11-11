import { Suspense, lazy } from "react";

export default function WidgetLoader({ widget }) {
  const Component = lazy(() => import(`./widgets/${widget.path}/index.jsx`));
  return (
    <Suspense fallback={<div>Loading {widget.name}…</div>}>
      <Component />
    </Suspense>
  );
}