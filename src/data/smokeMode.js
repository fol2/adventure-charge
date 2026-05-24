export function isSmokeMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).has('smoke');
}

export function setSmokeStateReader(readState) {
  if (isSmokeMode()) {
    window.starDashSmoke = {
      readState
    };
  }
}
