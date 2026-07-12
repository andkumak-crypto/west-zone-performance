/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import TrainerDashboard from "./components/TrainerDashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <TrainerDashboard />
    </ErrorBoundary>
  );
}

