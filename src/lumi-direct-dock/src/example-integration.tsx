/** ILLUSTRATIVE WIRING ONLY. Replace imports with real app paths after repository audit. */
import React from 'react';
import { LumiDirectDock } from './LumiDirectDock';
import type { DirectMessagingAdapter } from './types';

// DO NOT use a mock adapter in production. Provide the authenticated app adapter.
export function MountedDirectDock({ dmAdapter }: { dmAdapter: DirectMessagingAdapter }) {
  return <LumiDirectDock adapter={dmAdapter} rightOffsetPx={90} bottomOffsetPx={16} />;
}
